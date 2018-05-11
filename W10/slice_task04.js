function Slice( volume, nvector, rpoint )
{
    var geometry = new THREE.Geometry();
    var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
    
    var smin = volume.min_value;
    var smax = volume.max_value;

    //create colormap
    var cmap = new THREE.Lut( "rainbow", smax );
    cmap.setMax(smax);
    
    var lut = new KVS.MarchingCubesTable();
    var counter = 0;
    var v0_index = new THREE.Vector3();  //add vectors
    var rv0 = new THREE.Vector3();  //use at interpolated_vertex
    var rv1 = new THREE.Vector3();  //use at interpolated_vertex
    for ( var z = 0; z < volume.resolution.z - 1; z++ )
    {
        for ( var y = 0; y < volume.resolution.y - 1; y++ )
        {
            for ( var x = 0; x < volume.resolution.x - 1; x++ )
            {
		v0_index.set( x, y, z );
                var index = table_index( v0_index );
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

                    var v01 = interpolated_vertex( v0, v1 );
                    var v23 = interpolated_vertex( v2, v3 );
                    var v45 = interpolated_vertex( v4, v5 );

		    
		    var color01 = interpolated_color( v0, v1, v01 );
		    var color23 = interpolated_color( v2, v3, v23 );
		    var color45 = interpolated_color( v4, v5, v45 );
		    
                    geometry.vertices.push( v01 );
                    geometry.vertices.push( v23 );
                    geometry.vertices.push( v45 );

                    var id0 = counter++;
                    var id1 = counter++;
                    var id2 = counter++;

		    var face = new THREE.Face3( id0, id1, id2 );
		    face.vertexColors[0] = cmap.getColor( color01 );
		    face.vertexColors[1] = cmap.getColor( color23 );
		    face.vertexColors[2] = cmap.getColor( color45 );
                    geometry.faces.push( face );

                }
            }
        }
    }

    geometry.computeVertexNormals();

    // double side of faces will be rendered
    material.side = THREE.DoubleSide;
    return new THREE.Mesh( geometry, material );

    

    //  change table_index for task4
    function table_index( v0_index )
    {	
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
    
    // change interpolated_vertex for task4
    function interpolated_vertex( v0, v1 )
    {	
	rv0.subVectors( v0, rpoint );
	rv1.subVectors( v1, rpoint );
	var s0 = rv0.dot( nvector );
        var s1 = rv1.dot( nvector );
	
	var t = ( 0 - s0 ) / ( s1 - s0 );

	rv0.set( v0.x, v0.y, v0.z);
	rv1.set( v1.x, v1.y, v1.z);
	
        return new THREE.Vector3().addVectors( rv0.multiplyScalar( 1 - t ), rv1.multiplyScalar( t ) );
	
    }

    
    // create interpolated_color for task4
    function interpolated_color( v0, v1, v01 )
    {
	var dv0 = v01.distanceTo( v0 );
	var dv01 = v1.distanceTo( v0 );

	var vx = volume.resolution.x;
	var vxy = vx * volume.resolution.y;
	var id0 = v0.x + ( v0.y * vx ) + ( v0.z * vxy );
	var id1 = v1.x + ( v1.y * vx ) + ( v1.z * vxy );
	
	var s0 = volume.values[id0][0];
	var s1 = volume.values[id1][0];
	
	var t = dv0 / dv01;

	return t * s1 + ( 1 - t ) * s0;
    }
}
