class State {
    constructor(){
        this.users = [];
        this.timeStart = Date.now();
        this.timeNow = this.timeStart;
        this.readyState = false;
    }
    getUsers(){
        return this.users;
    }
    update(){
        this.updateTime();
        this.users.forEach(function(user){
            if(user.moving && user.canvasFocus){
                user.move();
            }
        });
    }
    updateTime(){
        this.timeNow = Date.now();
    }
    getStartTime(){
        return this.timeStart;
    }
    getTimeNow(){
        return this.timeNow;
    }
    setReady(val){
        this.readyState = val;
    }
    deleteUser(id) {
        for(var i = 0; i < this.users.length; i++) {
            if(this.users[i].id === id) {
                this.users.splice(i,1);
            }
        }
    }
    addUser(user){
        this.users.push(user);
    }
    getCurrentState(){
        return {
            users: this.users,
            timeStart: this.timeStart,
            timeNow: this.timeNow,
            readyState: this.readyState
        }
    }
}

module.exports = State;