CONTROLS: 
             JUMP -                      Space Bar
             Down Jump -                 S Key




1.Open your terminal and type:
 
   cd mini-arcade
   cd web-ui
   npm install
   npm run dev
   
2.Open your browser and visit the link shown in your terminal (usually http://localhost:5173). *This was the link on my end, can changed depending on different computer
3.Enjoy the arcade vibes!

** why I did not use the suggested file structure

    I tried using the suggested file structure for the beginning but I ran into the Iframe not loading the game
    This was due to vite server not registering the game folder correctly 
    This resulted to having to use the public folder to store the game files as this is a Vite standard (From research)

- React only

