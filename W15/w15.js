function main()
{
    var volume = new KVS.LobsterData();
    var screen = new KVS.THREEScreen();

    screen.init( volume, {
        width: window.innerWidth * 0.8,
        height: window.innerHeight,
	targetDom: document.getElementById('display'),
        enableAutoResize: false
    });
    // bounds
    var bounds = Bounds( volume );
    screen.scene.add( bounds );

    //slice
    var nvec1 = 0.5;
    var nvec2 = 0.5;
    var nvec_x = Math.cos(nvec2 * Math.PI) * Math.cos(nvec1 * Math.PI);
    var nvec_y = Math.cos(nvec2 * Math.PI) * Math.sin(nvec1 * Math.PI);
    var nvec_z = Math.sin(nvec2 * Math.PI);
    var nvector = new THREE.Vector3( nvec_x, nvec_y, nvec_z );
    var rpoint = new THREE.Vector3( volume.resolution.x / 2, volume.resolution.y / 2, volume.resolution.z / 2);
    var slices = Slice( volume, nvector, rpoint );
    screen.scene.add( slices );

    // isosurface
    var smin = volume.min_value;
    var smax = volume.max_value;
    var isovalue = KVS.Mix( smin, smax, 0.5 );
    var surfaces = Isosurfaces( volume, Math.round(isovalue), screen );
    screen.scene.add( surfaces );

    // isosurface
    document.getElementById('label').innerHTML = "Isovalue: " + ( '000' + Math.round( isovalue ) ).slice( -3 );
    
    document.getElementById('isovalue')
        .addEventListener('mousemove', function() {
            var value = +document.getElementById('isovalue').value;
            var isovalue = KVS.Mix( smin, smax, value );
            document.getElementById('label').innerHTML = "Isovalue: " + ( '000' + Math.round( isovalue ) ).slice( -3 );
        });
    
    document.getElementById('change-isovalue-button')
        .addEventListener('click', function() {
            screen.scene.remove( surfaces );
            var value = +document.getElementById('isovalue').value;
            var isovalue = KVS.Mix( smin, smax, value );
	    surfaces = Isosurfaces( volume, Math.round(isovalue), screen );
            screen.scene.add( surfaces );
        });

    // slice

    document.getElementById('label2-angle1').innerHTML = "angle1: " + ( '000' + Math.round( 360*nvec1 ) ).slice( -3 );
    
    document.getElementById('nomalvector1')
        .addEventListener('mousemove', function() {
            nvec1 = +document.getElementById('nomalvector1').value;
            document.getElementById('label2-angle1').innerHTML = "angle1: " + ( '000' + Math.round( 360*nvec1 ) ).slice( -3 );
        });

    document.getElementById('label2-angle2').innerHTML = "angle2: " + ( '000' + Math.round( 360*nvec2 ) ).slice( -3 );
    
    document.getElementById('nomalvector2')
        .addEventListener('mousemove', function() {
            nvec2 = +document.getElementById('nomalvector2').value;
            document.getElementById('label2-angle2').innerHTML = "angle2: " + ( '000' + Math.round( 360*nvec2 ) ).slice( -3 );
        });

    document.getElementById('change-nvec-button')
        .addEventListener('click', function() {
            screen.scene.remove( slices );
            nvec1 = +document.getElementById('nomalvector1').value;
            nvec2 = +document.getElementById('nomalvector2').value;
	    nvec_x = Math.cos(nvec2 * Math.PI) * Math.cos(nvec1 * Math.PI);
	    nvec_y = Math.cos(nvec2 * Math.PI) * Math.sin(nvec1 * Math.PI);
	    nvec_z = Math.sin(nvec2 * Math.PI);
	    nvector = new THREE.Vector3( nvec_x, nvec_y, nvec_z );
	    slices = Slice( volume, nvector, rpoint );
	    screen.scene.add( slices );
        });

    // mouse
    document.addEventListener( 'mousemove', function() {
        screen.light.position.copy( screen.camera.position );
    });
    // window
    window.addEventListener( 'resize', function() {
        screen.resize( [ window.innerWidth*0.8, window.innerHeight ] );
    });

    screen.loop();
}
