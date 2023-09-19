

function imgClick(id) {

    let img = document.getElementById(id).src
    document.getElementById('main-img').src = img
  
  }
  
  function selectLabel(element) {
    var labels = document.querySelectorAll('.custom-label');
    for (var i = 0; i < labels.length; i++) {
      labels[i].classList.remove('selected');
    }
  
    element.classList.add('selected');
  }
  
  //
  // window.addEventListener('resize', slideImage);
  //

  const mainImage = document.querySelector('.main-image');
  const img = document.getElementById('main-img');
  let zoomEnabled = false;
  let currentImageIndex = 0;
  
  const imgItems = Array.from(document.querySelectorAll('.img-item'));
  imgItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      setCurrentImage(index);
    });
  });
  
  mainImage.addEventListener('click', enableZoom);
  mainImage.addEventListener('mousemove', zoomIn);
  mainImage.addEventListener('mouseleave', zoomOut);
  
  function setCurrentImage(index) {
    currentImageIndex = index;
    const selectedImg = imgItems[index].querySelector('img');
    img.src = selectedImg.src;
    zoomEnabled = false;
    img.style.transform = 'scale(1)';
  }
  
  function enableZoom() {
    zoomEnabled = true;
  }
  
  function zoomIn(event) {
    if (!zoomEnabled) {
      return;
    }
  
    const boundingRect = mainImage.getBoundingClientRect();
    const mouseX = event.clientX - boundingRect.left;
    const mouseY = event.clientY - boundingRect.top;
  
    const offsetX = (mouseX / boundingRect.width) * 100;
    const offsetY = (mouseY / boundingRect.height) * 100;
  
    img.style.transformOrigin = `${offsetX}% ${offsetY}%`;
    img.style.transform = 'scale(2)'; // Adjust the scale factor as desired
  }
  
  function zoomOut() {
    img.style.transform = 'scale(1)';
    zoomEnabled = false;
  }