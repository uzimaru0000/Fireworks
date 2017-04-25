'use struct'

const electron = require('electron');

let APP = {};

window.onload = () => {
    const screen = electron.screen;
    const size = screen.getPrimaryDisplay().size;
    APP.display = new Display('canvas');
    APP.display.width = size.width;
    APP.display.height = size.height;
    APP.display.on('update', function(e) {
        if (e % 60 === 0) this.addChild(new Fireflower(Random.range(0, this.width, true), this.height));
    });
};

class Fireflower extends Group {
    constructor(x, y) {
        super();
        this.pos = new Vector(x, y);
        this.baseX = x;
        this.baseY = Random.range(0, 640, true);
        this.flag = false;
        this.color = Color.random();
        this.counter = 0;
        this.on('update', e => {
            if (!this.flag) {
                this.pos.y -= 3;
                this.pos.x = this.baseX + Math.sin(e / 5) * 2;
                let b = new Ball(5);
                b.pos = this.globalPos.clone();
                this.parent.addChild(b);
                if (this.pos.y <= this.baseY) this.flag = true; 
            } else {
                let angle = Math.PI / 5;
                for (let i = 0; i < 10; i++) {
                    let b = new PhysicsBall(5);
                    b.color = this.color.toString();
                    b.pos = this.pos.clone();
                    b.velocity = new Vector(Math.cos(angle * i), Math.sin(angle * i)).mul(5);
                    this.parent.addChild(b);
                }
                this.parent.removeChild(this);
            }
        });
    }
}

class Ball extends Circle {
    constructor(r) {
        super(r);
        this.color = 'orange';
        this.on('update', () => {
            this.scale.div(1.1);
            if (this.scale.length <= 0.1) {
                this.parent.removeChild(this);
            }
        });
    }
}

class PhysicsBall extends Circle {
    constructor(r) {
        super(r);
        this.velocity = new Vector();
        this.accel = Vector.up.mul(0.15);
        this.s = this.scale.clone();
        this.flag = false;
        this.n = 10;
        this.on('update', () => {
            if (!this.flag && this.n > 0) {
                let b = new PhysicsBall(this.radius);
                b.velocity = this.velocity.clone();
                b.pos = this.pos.clone();
                b.n = --this.n;
                b.scale = this.scale.clone().div(1.1);
                b.color = this.color;
                this.parent.addChild(b);
                this.flag = true;
            }
            this.velocity.add(this.accel);
            this.pos.add(this.velocity);
            this.scale.div(1.01);

            if (this.pos.y >= APP.display.height && this.scale.length <= 0.1) {
                this.parent.removeChild(this);
            }
        });
    }
}