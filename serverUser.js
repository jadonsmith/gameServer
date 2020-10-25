// define some colors for the users
const colors = ["#f4cd89","#b62e35","#9bdc28","#a743fa","#ddfa5a","#12821d","#6dad0a","#190ca8","#fbab97","#836e53","#754aa8"];

class User{
    constructor(request) {
        this.ready = false;
        this.name = "unnamed";
        this.ip = request.socket.remoteAddress;
        this.joined = Date.now();
        this.id = 'user_' + Math.random().toString(36).substr(2, 12);
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = 15;
        this.moving = false;
        this.canvasFocus = false;
        this.location = {
            room: "mainRoom",
            x:Math.random() * 1280,
            y:Math.random() * 720
        }
        this.keyboard = {
            down: {
                upKey : false,
                leftKey : false,
                downKey : false,
                rightKey : false
            }
        };
        this.mouse = {
            inFocus : false,
            x:null,
            y:null,
            down:{
                active:false,
                timeStamp:null,
                x:null,
                y:null,
                duration:null,
                count: 0
            },
            up:{
                x:null,
                y:null,
                timeStamp:null
            }
        };
        this.walls = {
            max : 250,
            dots:[]
        };
        this.guns = {
            dotGun:{
                ammoMaxPerMag: 6,
                ammoMaxTotal: 20,
                ammoCurrentMag: 6,
                reloadSpeed : 1,
                damage : 1,
                shots:[]
            },
            shotGun:{
                ammoTotal : 20,
                ammoPerMag : 2,
                damage : 3,
                reloadSpeed : 2.5,
                shots:[]
            }
        };
    }
    getUser(){
        return{
            ready: this.ready,
            name: this.name,
            ip: this.ip,
            joined: this.joined,
            id: this.id,
            color: this.color,
            location: this.location,
            mouse: this.mouse,
            walls: this.walls,
            guns: this.guns,
            size: this.size
        }
    }
    addWall(x,y){
        if(this.walls.dots.length < this.walls.max){
            this.walls.dots.push({x,y})
        }
    }
    mouseMove(x,y){
        this.mouse.inWindow = true;
        this.mouse.x = x;
        this.mouse.y = y;
        if(this.mouse.down.active){
            this.addWall(x,y);
        }
    }
    stopMoving(){
        this.keyboard = {
            down: {
                upKey : false,
                leftKey : false,
                downKey : false,
                rightKey : false
            }
        };
        this.moving = false;
    }
    canvasFocusIn(){
        console.log("focus in");
        this.canvasFocus = true;
        this.stopMoving();
    }
    canvasFocusOut(){
        console.log("focus out");
        this.canvasFocus = false;
        this.stopMoving();
    }
    mouseDown(x,y){
        this.mouse.down.active = true;
        this.mouse.down.x = x;
        this.mouse.down.y = y;
        this.mouse.down.timeStamp = Date.now();
        if(this.guns.dotGun.shots.length < this.guns.dotGun.ammoMaxPerMag){
            this.guns.dotGun.ammoCurrentMag--;
            console.log(`${this.name} fired shot`);
            this.guns.dotGun.shots.push({
                source: this.location,
                location: this.location,
                destination: {
                    x: this.mouse.down.x,
                    y: this.mouse.down.y
                }
            });
        }
    }
    mouseUp(x,y){
        this.mouse.down.active = false;
        this.mouse.up.timeStamp = Date.now();
        this.mouse.up.x = x;
        this.mouse.up.y = y;
        let duration = this.mouse.up.timeStamp - this.mouse.down.timeStamp;
        this.mouse.down.duration = Math.floor(duration / 1000);
        console.log(`Mouse down at ${this.mouse.down.x}, up at ${this.mouse.up.x}, down for ${this.mouse.down.duration}s.`);
    }
    mouseLeave(){
        this.mouse.inWindow = false;
        /*user.keyboard.down.upKey = false;
        user.keyboard.down.leftKey = false;
        user.keyboard.down.downKey = false;
        user.keyboard.down.rightKey = false;*/
    }
    move(){
        if(this.keyboard.down.upKey){
            this.location.y = this.location.y - 10;
        }
        if(this.keyboard.down.leftKey){
            this.location.x = this.location.x - 10;
        }
        if(this.keyboard.down.downKey){
            this.location.y = this.location.y + 10;
        }
        if(this.keyboard.down.rightKey){
            this.location.x = this.location.x + 10;
        }
    }
    keyDown(key){
        switch(key){
            case "KeyW":
                this.keyboard.down.upKey = true;
                this.moving = true;
                //this.moveUp();
                break;
            case "KeyA":
                this.keyboard.down.leftKey = true;
                this.moving = true;
                //this.moveLeft();
                break;
            case "KeyS":
                this.keyboard.down.downKey = true;
                this.moving = true;
                //this.moveDown();
                break;
            case "KeyD":
                this.keyboard.down.rightKey = true;
                this.moving = true;
                //this.moveRight();
                break;
        }
    }
    keyUp(key){
        switch(key){
            case "KeyW":
                this.keyboard.down.upKey = false;
                break;
            case "KeyA":
                this.keyboard.down.leftKey = false;
                break;
            case "KeyS":
                this.keyboard.down.downKey = false;
                break;
            case "KeyD":
                this.keyboard.down.rightKey = false;
                break;
        }
        /*
        let nonePressed = true;
        Object.values(this.keyboard.down).forEach(key=>{
            if(key){
                nonePressed = false;
            }
        });*/
    }
    setName(name){
        this.name = name;
    }
    getId(){
        return this.id;
    }
    getName(){
        return this.name;
    }
    /*send(obj){
        this.ws.send(JSON.stringify(obj));
    }*/
    setReady(boolean){
        this.ready = boolean;
    }
}

module.exports = User;