const potato = document.getElementById('potato');
const countDisplay = document.getElementById('count');
const clearBtn = document.getElementById('clear-btn');

const potato1 = new Image();
potato1.src = './assets/potato1.png';
const potato2 = new Image();
potato2.src = './assets/potato2.png';
const clearSound = new Audio('assets/clear_click.mp3');
const clickSound = new Audio('assets/click.mp3.mp3');
clickSound.load();
clearSound.load();

potato.addEventListener('mousedown', (e) => e.preventDefault());

let count = parseInt(localStorage.getItem('count')) || 0;
countDisplay.textContent = count;


potato.addEventListener('click', () => {

  potato.classList.add('clicked');


  potato.src = './assets/potato2.png';


  clickSound.currentTime = 0;
  clickSound.play();


  count++;
  countDisplay.textContent = count;


  localStorage.setItem('count', count);

 
  setTimeout(() => {
    potato.classList.remove('clicked');
    potato.src = './assets/potato1.png';
  }, 150);
});


clearBtn.addEventListener('click', () => {
  count = 0;
  countDisplay.textContent = count;
  localStorage.setItem('count', count);
  clearSound.currentTime = 0;
  clearSound.play();
});
