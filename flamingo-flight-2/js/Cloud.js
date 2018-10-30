
//Declaration of a Cloud as an object
Cloud = function(){
    this.mesh = new THREE.Object3D();
    
    var geom = new THREE.SphereGeometry(15,8,4);
    
    var mat = new THREE.MeshPhongMaterial({
     color: 0xffffff});
    
    //Random count of blocks
    var blocksCount = minCloudBlocksCount + Math.floor( Math.random()*(maxCLoudBlocksCount - minCloudBlocksCount));
    
    //Creation of each block
    for(var i = 0; i < blocksCount; i++)
    {
     var m = new THREE.Mesh(geom, mat);
    
    //Random position for every block
     m.position.x = i*5 + Math.floor(Math.random() * 5);
     m.position.y = Math.random()*10;
     m.position.z = Math.random()*10;
    
    //Random rotation for every block
     m.rotation.z = Math.random() * Math.PI * 2;
     m.rotation.y = Math.random() * Math.PI * 2;
    
    //Random scale too
     var s = 0.3 + Math.random() * 0.7;
     m.scale.set(s,s,s);
     
     m.castShadow = true;
     m.receiveShadow = true;
     
     this.mesh.add(m)
    }
    
    //Random rotation around Z axis with a PI/6 pitch
    var rand = 0 - 0.5 + Math.random() * (6 - 0 + 1)
    rand = Math.round(rand);
    
    this.mesh.rotateZ((Math.PI / 6) * rand);
    
}