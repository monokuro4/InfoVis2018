function main()
{
    var volume = new KVS.LobsterData();
    var screen = new KVS.THREEScreen();

    screen.init( volume, {
        width: window.innerWidth,
        height: window.innerHeight,
        enableAutoResize: false
    });

    var bounds = Bounds( volume );
    screen.scene.add( bounds );

    //add normal vector and reference point
    var nvector = new THREE.Vector3( 0.5, 0.8, 1 );
    var rpoint = new THREE.Vector3( volume.resolution.x / 2, volume.resolution.y / 2, volume.resolution.z / 2);
    var surfaces = Slice( volume, nvector, rpoint );
    screen.scene.add( surfaces );

    document.addEventListener( 'mousemove', function() {
        screen.light.position.copy( screen.camera.position );
    });

    window.addEventListener( 'resize', function() {
        screen.resize( [ window.innerWidth, window.innerHeight ] );
    });

    screen.loop();
}
