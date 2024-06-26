const admin = require('../../model/admin.js')
const User = require('../../model/customer.js')
const Order = require('../../model/order')
const pdfkit = require('pdfkit')

//login page
exports.adminLogin = async (req, res, next) => {
    try {
        const passwordError = req.app.locals.specialContext
        req.app.locals.specialContext = null

        console.log("adminlogin page")

        res.render('admin/adminLogin', { passwordError })
    } catch (error) {
        console.log(error.message)
    }
}


//dashboard
exports.getAdmin = async (req, res, next) => {
    try {
        console.log('admin dashboard')
        const orders = await Order.find({})
            .populate({
                path: 'products.products',
                select: 'name price quantity', // Select the fields you need
            }).populate('user', 'name')

        // console.log('orders :',orders);

        //total sales
        const totalSales = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total' }
                }
            }
        ])
        const totalSalesAmount = totalSales.length > 0 ? totalSales[0].total : 0;
        const totalRevenue = totalSalesAmount > 0 ? totalSalesAmount / 10 : 0;
        // console.log('Total Sales:', totalSalesAmount, 'total reven :', totalRevenue);

        // //total sales by month
        const totalSalesByMonth = await Order.aggregate([
            {
                $project: {
                    year: { $year: '$date' },
                    month: { $month: "$date" },
                    total: 1,
                }
            },
            {
                $group: {
                    _id: { year: '$year', month: '$month' },
                    totalSales: { $sum: '$total' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 },
            },

        ])

        const chartLabels = totalSalesByMonth.map(item => `${item._id.month}/${item._id.year}`);
        const chartData = totalSalesByMonth.map(item => item.totalSales);


        // //total sales by year
        const totalSalesByYear = await Order.aggregate([
            {
                $project: {
                    year: { $year: '$date' },
                    total: 1,
                }
            },
            {
                $group: {
                    _id: { year: '$year' },
                    totalSales: { $sum: '$total' }
                }
            },
            {
                $sort: { '_id.year': 1 }
            },
        ])

        const chartLabel = totalSalesByYear.map(item => item._id.year.toString());
        const chartDatas = totalSalesByYear.map(item => item.totalSales);
        const dateError = req.app.locals.dateError
        req.app.locals.dateError = null
        // console.log('chartLabels :', chartLabels, 'chartData :', chartData);

        // console.log('Total Sales by Month:', totalSalesByMonth);

        res.render('admin/adminDash', { totalSalesAmount, totalRevenue, chartData, chartLabels, chartLabel, chartDatas, orders, dateError })
    } catch (error) {
        console.log(error)
    }
}




//pdf download controller
exports.generatePDF = async (req, res) => {
    try {
        // Check if fromDate and toDate are provided
        if (!req.query.fromDate || !req.query.toDate) {
            req.app.locals.dateError = "Select the date";
            return res.redirect('/admin')

        }

        // Extract "From Date" and "To Date" from the form data
        const fromDate = new Date(req.query.fromDate);
        const toDate = new Date(req.query.toDate);

        // Find orders within the specified date range and populate necessary fields
        const orders = await Order.find({
            date: { $gte: fromDate, $lte: toDate }
        })
            .populate('user', 'name') // Populate the user's name
            .populate({
                path: 'products.products',
                select: 'name price quantity',
            });


        // Create a PDF document
        const doc = new pdfkit();
        // Pipe the PDF document to the response
        doc.pipe(res);

        // Add content to the PDF
        doc.text('Filtered Sales Report', { align: 'center' });
        doc.moveDown();

        // Check if orders is defined and contains data
        if (Array.isArray(orders) && orders.length > 0) {
            // Loop through the filtered orders and add order details to the PDF
            orders.forEach((order, index) => {
                doc.text(`Order ID: ${order._id}`);
                doc.text(`Date: ${order.date.toDateString()}`);
                doc.text(`Customer: ${order.user ? order.user.name : 'N/A'}`);
                doc.text('Product Details:');

                // Check if products exist and have a products array
                if (order.products && Array.isArray(order.products)) {
                    order.products.forEach((product) => {
                        doc.text(`${product.name} (Price: ${product.price}, Quantity: ${product.quantity})`);
                    });

                    const totalQuantity = order.products.reduce(
                        (total, product) => total + product.quantity, 0
                    );

                    const totalPrice = order.products.reduce(
                        (total, product) => total + (product.price * product.quantity), 0
                    );

                    doc.text(`Quantity: ${totalQuantity}`);
                    doc.text(`Price: ${totalPrice}`);
                } else {
                    doc.text('Product details not available.');
                    doc.text('Quantity: N/A');
                    doc.text('Price: N/A');
                }

                if (order.couponName) {
                    doc.text(`Discount: ${order.couponName}`);
                } else {
                    doc.text('Discount: No offer/discount');
                }

                doc.text(`Total Amount: ${order.total}`);

                // Add space between orders
                if (index < orders.length - 1) {
                    doc.moveDown();
                }
            });
        } else {
            // Handle the case when no orders are found or orders is empty
            doc.text('No orders found for the selected date range.');
        }




        // End the PDF document
        doc.end();

        // Set headers for PDF response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');

    } catch (error) {
        console.log(error);
        // Handle errors as needed
        res.status(500).send('Error generating PDF');
    }
};





//logout
exports.logout = async (req, res) => {
    try {
        console.log("session before logging out", req.session.isLogged);

        req.session.destroy()
        console.log("session after logout", req.session);
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}


//post admin dashboard
exports.adminDash = async (req, res) => {
    try {
        console.log('admin credentials checking')
        // console.log(req.body.email)
        // console.log(admin)

        const adminData = await admin.findOne({ email: req.body.email })
        if (adminData) {
            if (req.body.password === adminData.password) {
                req.session.isLogged = req.body.email;
                // console.log('admin password and email is correct', req.session.isLogged)
                res.redirect('/admin/adminDash')
            } else {
                req.app.locals.specialContext = "incorrect password or email"
                res.redirect('/admin')
            }
        } else {
            req.app.locals.specialContext = "incorrct admin details"
            res.redirect('/admin',)
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');

    }
}



// admin user page
exports.getUserData = async (req, res) => {
    try {
        const users = await User.find({})
        res.render('admin/adminUser', { users })

    } catch (error) {
        console.log(error)
    }
}


//block and unblock user

exports.userStatus = async (req, res) => {
    try {
        const userId = req.params.id
        const userData = await User.findById({ _id: userId })
        // console.log("user Data", userData)
        if (userData) {
            if (userData.status === true) {
                await User.findByIdAndUpdate({ _id: userId }, { $set: { status: false } })
            } else {
                await User.findByIdAndUpdate({ _id: userId }, { $set: { status: true } })
            }
        }
        // console.log("redirecting after blocking or unblocking")
        res.redirect('/admin/adminUser')
    } catch (error) {
        console.log(error.message)
    }
}







