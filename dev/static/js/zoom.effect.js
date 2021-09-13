let modal = document.getElementById("myModal");
let img = document.getElementById("myImg");
let img1 = document.getElementById("myImg1");
let img2 = document.getElementById("myImg2");
let modalImg = document.getElementById("img01");
let captionText = document.getElementById("caption");


img.onclick = function () {
  modal.style.display = "block";
  modalImg.src = this.src;
//   captionText.innerHTML = this.alt;
  
};

img1.onclick = function () {
  modal.style.display = "block";
  modalImg.src = this.src;
//   captionText.innerHTML = this.alt;
  
};

img2.onclick = function () {
  modal.style.display = "block";
  modalImg.src = this.src;
//   captionText.innerHTML = this.alt;
  
};

let span = document.getElementsByClassName("close")[0];

span.onclick = function () {
  modal.style.display = "none";
};
