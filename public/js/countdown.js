const update = () => {
   const countdown = document.getElementById('countdown');
   const contestStart = Date.parse(document.querySelector('meta[data-name="contest-start"]').getAttribute('content'));
   const now = Date.now();

   const remaining = contestStart - now;

   if (remaining < 0) {
      setTimeout(() => {
         location.reload();
      }, 3000)
      return;
   }

   const days = Math.floor(remaining / 1000 / 60 / 60 / 24);
   const hours = Math.floor(remaining / 1000 / 60 / 60) % 24;
   const minutes = Math.floor(remaining / 1000 / 60) % 60;
   const seconds = Math.floor(remaining / 1000) % 60;

   countdown.textContent = `${days === 0 ? '' : `${days} days + `}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
setInterval(update, 1000);
update();
