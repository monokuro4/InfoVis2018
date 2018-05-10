function Isosurfaces( volume, isovalue )
{
    var geometry = new THREE.Geometry();
    var material = new THREE.MeshStandardMaterial();
    
    var smin = volume.min_value;
    var smax = volume.max_value;
    isovalue = KVS.Clamp( isovalue, smin, smax );

    //add normal vector and reference point
    var nvector = new THREE.Vector3( 1, 1, 1 );
    var rpoint = new THREE.Vector3( volume.resolution.x / 2, volume.resolution.y / 2, volume.resolution.z / 2);
    
    var lut = new KVS.MarchingCubesTable();
    var cell_index = 0;
    var counter = 0;
    var v0_index = new THREE.Vector3();
    for ( var z = 0; z < volume.resolution.z - 1; z++ )
    {
        for ( var y = 0; y < volume.resolution.y - 1; y++ )
        {
            for ( var x = 0; x < volume.resolution.x - 1; x++ )
            {
		v0_index.set( x, y, z );
		var indices = cell_node_indices( cell_index++ );
                var index = table_index();
                if ( index == 0 ) { continue; }
                if ( index == 255 ) { continue; }

                for ( var j = 0; lut.edgeID[index][j] != -1; j += 3 )
                {
                    var eid0 = lut.edgeID[index][j];
                    var eid1 = lut.edgeID[index][j+2];
                    var eid2 = lut.edgeID[index][j+1];

                    var vid0 = lut.vertexID[eid0][0];
                    var vid1 = lut.vertexID[eid0][1];
                    var vid2 = lut.vertexID[eid1][0];
                    var vid3 = lut.vertexID[eid1][1];
                    var vid4 = lut.vertexID[eid2][0];
                    var vid5 = lut.vertexID[eid2][1];

                    var v0 = new THREE.Vector3( x + vid0[0], y + vid0[1], z + vid0[2] );
                    var v1 = new THREE.Vector3( x + vid1[0], y + vid1[1], z + vid1[2] );
                    var v2 = new THREE.Vector3( x + vid2[0], y + vid2[1], z + vid2[2] );
                    var v3 = new THREE.Vector3( x + vid3[0], y + vid3[1], z + vid3[2] );
                    var v4 = new THREE.Vector3( x + vid4[0], y + vid4[1], z + vid4[2] );
                    var v5 = new THREE.Vector3( x + vid5[0], y + vid5[1], z + vid5[2] );

                    var v01 = interpolated_vertex( v0, v1, isovalue );
                    var v23 = interpolated_vertex( v2, v3, isovalue );
                    var v45 = interpolated_vertex( v4, v5, isovalue );

                    geometry.vertices.push( v01 );
                    geometry.vertices.push( v23 );
                    geometry.vertices.push( v45 );

                    var id0 = counter++;
                    var id1 = counter++;
                    var id2 = counter++;
                    geometry.faces.push( new THREE.Face3( id0, id1, id2 ) );
                }
            }
            cell_index++;
        }
        cell_index += volume.resolution.x;
    }

    geometry.computeVertexNormals();

    //add color map for task1
    var cmap = [];
    for ( var i = 0; i < 256; i++ )
    {
        var S = i / 255.0; // [0,1]
        var R = Math.max( Math.cos( ( S - 1.0 ) * Math.PI ), 0.0 );
        var G = Math.max( Math.cos( ( S - 0.5 ) * Math.PI ), 0.0 );
        var B = Math.max( Math.cos( S * Math.PI ), 0.0 );
        var color = new THREE.Color( R, G, B );
        cmap.push( [ S, '0x' + color.getHexString() ] );
    }

    material.color = new THREE.Color().setHex( cmap[isovalue][1] );

    //end task1
    material.side = THREE.DoubleSide;
    return new THREE.Mesh( geometry, material );


    function cell_node_indices( cell_index )
    {
        var lines = volume.resolution.x;
        var slices = volume.resolution.x * volume.resolution.y;

        var id0 = cell_index;
        var id1 = id0 + 1;
        var id2 = id1 + lines;
        var id3 = id0 + lines;
        var id4 = id0 + slices;
        var id5 = id1 + slices;
        var id6 = id2 + slices;
        var id7 = id3 + slices;

        return [ id0, id1, id2, id3, id4, id5, id6, id7 ];
    }

    function table_index()
    {
	//  change for task4
	
	v0_index.sub( rpoint );
        var s0 = v0_index.dot( nvector );

	v0_index.x++;
        var s1 = v0_index.dot( nvector );

	v0_index.y++;
        var s2 = v0_index.dot( nvector );

	v0_index.x--;
        var s3 = v0_index.dot( nvector );

	v0_index.y--;
	v0_index.z++;
        var s4 = v0_index.dot( nvector );

	v0_index.x++;
        var s5 = v0_index.dot( nvector );

	v0_index.y++;
        var s6 = v0_index.dot( nvector );

	v0_index.x--;
        var s7 = v0_index.dot( nvector );

        var index = 0;
        if ( s0 > 0 ) { index |=   1; }
        if ( s1 > 0 ) { index |=   2; }
        if ( s2 > 0 ) { index |=   4; }
        if ( s3 > 0 ) { index |=   8; }
        if ( s4 > 0 ) { index |=  16; }
        if ( s5 > 0 ) { index |=  32; }
        if ( s6 > 0 ) { index |=  64; }
        if ( s7 > 0 ) { index |= 128; }

        return index;
    }
    
    // chang for task2
    function interpolated_vertex( v0, v1, s )
    {
	/*
	var vx = volume.resolution.x;
	var vxy = vx * volume.resolution.y;
	var id0 = v0.x + ( v0.y * vx ) + ( v0.z * vxy );
	var id1 = v1.x + ( v1.y * vx ) + ( v1.z * vxy );
	
	var s0 = volume.values[id0][0];
	var s1 = volume.values[id1][0];
	var t = ( s - s0 ) / ( s1 - s0 );
	
        return new THREE.Vector3().addVectors( v0.multiplyScalar( 1 - t ), v1.multiplyScalar( t ) );

	*/
	var rv0 = new THREE.Vector3().addVectors( v0, rpoint.negate() );
	var rv1 = new THREE.Vector3().addVectors( v0, rpoint.negate() );;
	var s0 = rv0.dot( nvector );
        var s1 = rv1.dot( nvector );
	
	var t = ( 0 - s0 ) / ( s1 - s0 );
	
        return new THREE.Vector3().addVectors( v0.multiplyScalar( 1 - t ), v1.multiplyScalar( t ) );
	
    }

	// end task2
}
