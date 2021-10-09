

/*

    Tareas:
    ------

    1) Modificar a función "generarSuperficie" para que tenga en cuenta los parametros filas y columnas al llenar el indexBuffer
       Con esta modificación deberían poder generarse planos de N filas por M columnas

    2) Modificar la funcion "dibujarMalla" para que use la primitiva "triangle_strip"

    3) Crear nuevos tipos funciones constructoras de superficies

        3a) Crear la función constructora "Esfera" que reciba como parámetro el radio

        3b) Crear la función constructora "TuboSenoidal" que reciba como parámetro la amplitud de onda, longitud de onda, radio del tubo y altura.
        (Ver imagenes JPG adjuntas)
        
        
    Entrega:
    -------

    - Agregar una variable global que permita elegir facilmente que tipo de primitiva se desea visualizar [plano,esfera,tubosenoidal]
    
*/


var superficie3D;
var mallaDeTriangulos;

var filas=100;
var columnas=100;


function crearGeometria(){
        

    if (figura=="plano") {
        superficie3D=new Plano(3, 3);
    }        
    else if (figura=="esfera") {
        superficie3D=new Esfera(1);
    }        
    else if (figura=="tubo senoidal") {
        superficie3D=new TuboSenoidal(0.05, 0.1, 0.4, 1.2);
    }    
    //superficie3D=new Plano(3,3);
    //superficie3D=new Esfera(3);
    //superficie3D=new TuboSenoidal(0.05, 0.1, 0.4, 1.2);

    mallaDeTriangulos=generarSuperficie(superficie3D,filas,columnas);
    
}

function dibujarGeometria(){
    
    dibujarMalla(mallaDeTriangulos);

}

function Plano(ancho,largo){

    this.getPosicion=function(u,v){

        var x=(u-0.5)*ancho;
        var z=(v-0.5)*largo;
        return [x,0,z];
    }

    this.getNormal=function(u,v){
        return [0,1,0];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function Esfera(radio){

    this.getPosicion=function(u,v){

        // Ecuacion de una esfera en el espacio cartesiano
        // Cada punto en espacio de la superficie de una esfera puede ser definido usando las coordenadas esféricas (r, ϕ, θ) mediante
        // las siguientes ecuaciones parametricas:        
        // x = r * sin(theta) * cos(2*phi)
        // y = r * cos(theta)
        // z = r * sin(theta) * sin(2*phi)        
        // En donde r = radio, 0 <= theta <= PI y 0 <= phi <=2*PI

        var x = radio * Math.sin(Math.PI*v) * Math.cos(2*Math.PI*u);
        var y = radio * Math.cos(Math.PI*v);
        var z = radio * Math.sin(Math.PI*v) * Math.sin(2*Math.PI*u);
        
        return [x,y,z];
    }

    this.getNormal=function(u,v){
        
        var position = this.getPosicion(u,v);
        return [position.x, position.y, position.z];
    }

    this.getCoordenadasTextura=function(u,v){
        
        return [u,v];
    }    
}


function TuboSenoidal(amplitudDeOnda, longitudDeOnda, radio, altura){
    
    this.getPosicion=function(u,v){

        // Ecuacion de un cilindro liso en el espacio cartesiano:
        // x = r * cos(2*PI*u)
        // y = v / h
        // z = r * sin(2*PI*u)       
        // En donde r = radio, h = altura

        // Considerando la senoide, se modula el radio (con valor maximo amplitudDeOnda) segun el valor del parametro v:
        var x = Math.cos(2*Math.PI*u) * (radio + amplitudDeOnda*Math.sin(2*Math.PI/longitudDeOnda*v));
        var y = (v - 0.5) * altura;        
        var z = Math.sin(2*Math.PI*u) * (radio + amplitudDeOnda*Math.sin(2*Math.PI/longitudDeOnda*v));
        
        return [x,y,z];
    }

    this.getNormal=function(u,v){
        
        var delta = 0.01;        
        var v1 = this.getPosicion(u + delta, v);
        var v2 = this.getPosicion(u, v + delta);

        return glMatrix.vec3.cross([],v1,v2);
    }

    this.getCoordenadasTextura=function(u,v){
        
        return [u,v];
    }
}

function generarSuperficie(superficie,filas,columnas){
    
    positionBuffer = [];
    normalBuffer = [];
    uvBuffer = [];

    for (var i=0; i <= filas; i++) {
        for (var j=0; j <= columnas; j++) {

            var u=j/columnas;
            var v=i/filas;

            var pos=superficie.getPosicion(u,v);

            positionBuffer.push(pos[0]);
            positionBuffer.push(pos[1]);
            positionBuffer.push(pos[2]);

            var nrm=superficie.getNormal(u,v);

            normalBuffer.push(nrm[0]);
            normalBuffer.push(nrm[1]);
            normalBuffer.push(nrm[2]);

            var uvs=superficie.getCoordenadasTextura(u,v);

            uvBuffer.push(uvs[0]);
            uvBuffer.push(uvs[1]);

        }
    }

    // Buffer de indices de los triángulos
    
    var indexSize = 0;
    indexBuffer=[];  
    //indexBuffer=[0,1,2,2,1,3]; // Estos valores iniciales harcodeados solo dibujan 2 triangulos, REMOVER ESTA LINEA!

    for (i=0; i < filas; i++) {
        for (j=0; j < columnas; j++) {

            // completar la lógica necesaria para llenar el indexbuffer en funcion de filas y columnas
            // teniendo en cuenta que se va a dibujar todo el buffer con la primitiva "triangle_strip" 
            
            indexBuffer[indexSize++] = i * (columnas + 1) + j; //Indice superior izquierdo del quad
            indexBuffer[indexSize++] = (i + 1) * (columnas + 1) + j; //Indice inferior izquierdo del quad

            // En proxima iteracion se agregan indice superior derecha e indice inferior derecho del quad actual como
            //  como si fueran los izquierdos del nuevo quad a derecha
        }

        // Al llegar a la ultima columna completo ultimos 2 triangulos del ultimo quad de esa fila
        indexBuffer[indexSize++] = i * (columnas + 1) + j;
        indexBuffer[indexSize++] = (i + 1) * (columnas + 1) + j;

        // Ademas si quedan mas filas repito indice inferior derecho de ultimo quad seguido del indice superior izquierda del primer quad de
        //  la siguiente fila para no cortar el strip
        if(i != (filas - 1) ){
            indexBuffer[indexSize++] = (i + 1) * (columnas + 1) + j;
            indexBuffer[indexSize++] = (i + 1) * (columnas + 1) + 0;
        }
    } 



    // Creación e Inicialización de los buffers

    webgl_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionBuffer), gl.STATIC_DRAW);
    webgl_position_buffer.itemSize = 3;
    webgl_position_buffer.numItems = positionBuffer.length / 3;

    webgl_normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalBuffer), gl.STATIC_DRAW);
    webgl_normal_buffer.itemSize = 3;
    webgl_normal_buffer.numItems = normalBuffer.length / 3;

    webgl_uvs_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_uvs_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvBuffer), gl.STATIC_DRAW);
    webgl_uvs_buffer.itemSize = 2;
    webgl_uvs_buffer.numItems = uvBuffer.length / 2;


    webgl_index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webgl_index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBuffer), gl.STATIC_DRAW);
    webgl_index_buffer.itemSize = 1;
    webgl_index_buffer.numItems = indexBuffer.length;

    return {
        webgl_position_buffer,
        webgl_normal_buffer,
        webgl_uvs_buffer,
        webgl_index_buffer
    }
}

function dibujarMalla(mallaDeTriangulos){
    
    // Se configuran los buffers que alimentaron el pipeline
    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_position_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mallaDeTriangulos.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_uvs_buffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, mallaDeTriangulos.webgl_uvs_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_normal_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, mallaDeTriangulos.webgl_normal_buffer.itemSize, gl.FLOAT, false, 0, 0);
       
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mallaDeTriangulos.webgl_index_buffer);


    if (modo!="wireframe"){
        gl.uniform1i(shaderProgram.useLightingUniform,(lighting=="true"));                    
        /*
            Aqui es necesario modificar la primitiva por triangle_strip
        */
       // Item 2
        gl.drawElements(gl.TRIANGLE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
    
    if (modo!="smooth") {
        gl.uniform1i(shaderProgram.useLightingUniform,false);
        gl.drawElements(gl.LINE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
 
}

