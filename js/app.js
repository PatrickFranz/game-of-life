'use strict';

class Game{
  constructor(){
    this.canvas = document.getElementById('world');
    this.NUM_WOLVES = 35;
    this.NUM_RABBITS = 50;
    this.DAY = 0;
    this.wolfCountEl = document.querySelector('.wolf-count');
    this.rabbitCountEl = document.querySelector('.rabbit-count');
    this.timeCount = document.querySelector('.time-count');
    
    if(this.canvas.getContext){
      this.world = this.canvas.getContext('2d');
    } else {
      console.log('Canvas not supported.');
    }
  }
  
  run(){
    this.draw(this.createSeed());
  }
  
  draw(map){
    this.world.clearRect(0,0, this.canvas.width, this.canvas.height);
    map.forEach( (lifeform) => {
      if(lifeform.constructor.name === 'Rabbit'){
      this.world.beginPath();
      this.world.strokeStyle = lifeform.color;
      this.world.arc(lifeform.location.x, 
                     lifeform.location.y, 
                     5, 0, Math.PI * 2);
      this.world.stroke();
      } else {
        this.world.fillStyle = lifeform.color;
        this.world.fillRect(lifeform.location.x, 
                            lifeform.location.y, 
                            10, 10);

      }
    });
    
    if(this.DAY < 20){
      setTimeout( () => {
        this.tick(map);     
      }, 1000);
    }
  }
  
  tick(map){
    // console.log(++this.DAY, 'Total: ' + map.length);
    ++this.DAY;
    this.updateStats(map);
    map.forEach( (lifeform) => {  
      lifeform.tick(map, this.DAY, this.canvas);
      //If lifeform is carnivore and neighbor is herbavore eat() 
      //If lifeform is herb and neighbor is carn run().
    });
    this.draw(map);
  }

  updateStats(map){
    const wolves = map.filter( life => life.constructor.name === 'Wolf');
    this.wolfCountEl.innerHTML = wolves.length;
    this.rabbitCountEl.innerHTML = map.length - wolves.length;
    this.timeCount.innerHTML = this.DAY;
  }
  
  createSeed(){
    //Create 10 Wolves and 10 Rabbits
    const lifeforms = [];
    for(let i=0; i<this.NUM_WOLVES; i++){
      lifeforms.push(new Wolf(this.canvas));
    }
    for(let i=0; i<this.NUM_RABBITS; i++){
      lifeforms.push(new Rabbit(this.canvas));
    }
    return lifeforms;
  }
}

class Animal{
  constructor(canvas, coords = null){
    this.canvas = canvas;
    this.CANVAS_BORDER = 20;
    this.location = coords || this.getRandCoords();
    this.age = 0;
    this.neighbors = [];
    this.canBreed = false;
  }
  
  tick(map, day, canvas){
    this.move();
      //Check if lifeform has neighbor(s)within 20px)
      this.neighbors = map.filter( (n) => {
        return  this !== n 
                && Math.abs(this.location.x - n.location.x) < 50 
                && Math.abs(this.location.y - n.location.y) < 50 
      });
    
      //Death by under/over population
      if(this.neighbors.length < 1 || this.neighbors.length > 3 ){ 
        this.die(map);
        return;
      }
      //Check neighbors, if it's same species; breed().
      this.neighbors.forEach( (neighbor) => {
        if(neighbor.constructor.name === this.constructor.name){
          if(this.breed(day)){
            //Place baby beside parent.
            map.push(new this.constructor(canvas, 
              {x: this.location.x + 10, y: this.location.y})
            );
            console.log(`breeding...`);
          }
        }
      });
  }
  
  breed(day){
    //Attempt to breed
    if(day % this.breedingCycle === 0){
      return Math.random() < this.chanceOfBreeding;
    }
  }
  
  die(map){
    map.splice(map.indexOf(this), 1);
  }
  
  move(){
    //Move in a semi random direction
    let signX = Math.random() < 0.5 ? 1 : -1;
    let signY = Math.random() < 0.5 ? 1 : -1;
    
    let xMove = this.location.x + (this.speed * signX);
    let yMove = this.location.y + (this.speed * signY);
    
    if(xMove <= this.CANVAS_BORDER || xMove > this.canvas.width - this.CANVAS_BORDER){
      xMove = this.location.x + (this.speed * signX * -1);
    } 
    if(yMove <= this.CANVAS_BORDER || yMove > this.canvas.height - this.CANVAS_BORDER){
      yMove = this.location.y + (this.speed * signY * -1);
    }

    this.location.x = xMove; 
    this.location.y = yMove;
  }
  
  getRandCoords(){
    const xMax = this.canvas.width - this.CANVAS_BORDER;
    const yMax = this.canvas.height - this.CANVAS_BORDER;
    const min = this.CANVAS_BORDER
    return {
      x: Math.floor(Math.random() * (xMax - min) + min),
      y: Math.floor(Math.random() * (yMax - min) + min)
    }
  }
}

class Wolf extends Animal{
  constructor(canvas, coords = null){
    super(canvas, coords);
    this.type = 'carnavore';
    this.chanceOfBreeding = 0.4;
    this.litterSize = Math.floor(Math.random * (3 - 1) + 1);
    this.breedingCycle = 5;  //Can only breed once every 5 ticks
    this.speed = 10;
    this.color = 'rgb(200, 0, 0)';
  }
}

class Rabbit extends Animal{
  constructor(canvas, coords = null){
    super(canvas, coords);
    this.type = 'herbavore';
    this.chanceOfBreeding = 0.9;
    this.litterSize = Math.floor(Math.random * (7 - 2) + 2);
    this.speed = 10;
    this.color = 'rgb(0, 200, 0)';
  }
}

const game = new Game();
game.run();