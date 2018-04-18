Vec3 = function(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
}

Vec3.prototype.add = function(v){
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
}

Vec3.protptype.sum = function(){
    return this.x + this.y +this.z;
}
