

// model
const User = require('../../model/customer.js')
const Address = require('../../model/adress.js')


// user account
exports.userAccount = async (req, res) => {
    try {
        console.log('user account');
        const userId = req.session.name;
        const userData = await User.findOne({ _id: userId });
        let referralLink =""
        
        if (userData.referral) {
            console.log("refferal is there")
            const referralCode = userData.referral; // Replace with the actual referral code
            const signUpURL = 'https://trenzyworld.online/signUp'; // Replace with your website's sign-up URL
            referralLink = `${signUpURL}?referral=${referralCode}`;

        }

        const userAddresses = await Address.find({ user: userId }, 'addressField');
        const allAddresses = [];

        for (const userAddress of userAddresses) {
            if (userAddress.addressField && userAddress.addressField.length > 0) {
                allAddresses.push(...userAddress.addressField);
            }
        }

        res.render("user/userProfile", { userData, allAddresses,referralLink });
    } catch (error) {
        console.log(error.message);
    }
}


//get user details edit page 
exports.getUserEdit = async (req, res) => {
    const userId = req.session.name
    const userData = await User.findOne({ _id: userId })
    res.render('user/editProfile', { userData })

}

// update user
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id
        const data = await User.updateOne({ _id: userId }, {
            $set: {
                name: req.body.name,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone
            }
        })
        res.redirect("/userProfile")
    } catch (error) {
        console.log(error.message);
    }
}

//user get address
exports.getAddAddress = async (req, res) => {
    try {
        const userId = req.session.name
        const userData = await User.findOne({ _id: userId })
        res.render('user/addAdress', { userData })
    } catch (error) {
        console.log(error.message)
    }
}

//user post add address
exports.postAddAddress = async (req, res) => {
    try {
        const userId = req.session.name;

        const newAddress = {
            name: req.body.name,
            phone: req.body.phone,
            state: req.body.state,
            district: req.body.district,
            town: req.body.town,
            pincode: req.body.pincode,
            address: req.body.address
        };

        // Find the user's address document
        let userAddress = await Address.findOne({ user: userId });

        // If the user has no address document, create a new one
        if (!userAddress) {
            userAddress = new Address({ user: userId, addressField: [] });
        }

        // Push the new address into the addressField array
        userAddress.addressField.push(newAddress);

        // Save the user's address document
        await userAddress.save();

        res.redirect('/userProfile');
    } catch (error) {
        // Handle the error and provide an appropriate response to the user
        res.status(500).send('Error adding address');
    }
};



//user delete address
exports.deleteAdd = async (req, res) => {
    try {
        const userId = req.session.name
        const addressId = req.params.id
        await Address.updateOne(
            { user: userId },
            { $pull: { addressField: { _id: addressId } } }
        );
        res.redirect('/userProfile')
    } catch (error) {
        console.log(error.message)
    }
}