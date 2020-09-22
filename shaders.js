const sceneVs = `#version 300 es
in vec4 aVertexPosition;
in vec3 aVertexNormal;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
out vec3 vLighting;

void main(void){
    gl_Position =  uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    
    // Apply lighting effect

    vec3 ambientLight = vec3(0.1);
    vec3 directionalLightColor = vec3(1, 1, 1);
    vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

    float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
}
`

const sceneFs = `#version 300 es
precision highp float;
in vec3 vLighting;
out vec4 outColor;
void main(void){
    outColor = vec4(vLighting, 1.0);
    //outColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`

const postVs = `#version 300 es
in vec4 aVertexPosition;
out vec2 uv;
void main(void){
    gl_Position = aVertexPosition;
    uv = vec2((aVertexPosition.x + 1.0) / 2.0, (aVertexPosition.y + 1.0) / 2.0);
}
`

const passFs = `#version 300 es
precision highp float;
uniform sampler2D tex;
uniform int width;
uniform int height;
in vec2 uv;
out vec4 outColor;
void main(void){
    highp vec4 dst = vec4(0.0);
    dst = texture(tex, uv);
    outColor = vec4(dst.rgb, 1.0);
}
`

const laplacianFs = `#version 300 es
precision highp float;
uniform sampler2D tex;
uniform int width;
uniform int height;
in vec2 uv;
out vec4 outColor;
void main(void){
    highp vec4 dst = vec4(0.0);
    dst += texture(tex, uv + vec2(-1.0,  1.0) / 600.0) * (-1.0);
    dst += texture(tex, uv + vec2(0.0,  1.0) / 600.0) * (-1.0);
    dst += texture(tex, uv + vec2(1.0,  1.0) / 600.0) * (-1.0);
    dst += texture(tex, uv + vec2(-1.0,  0.0) / 600.0) * (-1.0);
    dst += texture(tex, uv + vec2(0.0,  0.0) / 600.0) * 8.0;
    dst += texture(tex, uv + vec2(1.0,  0.0) / 600.0) * (-1.0);
    dst += texture(tex, uv + vec2(-1.0,  -1.0) / 600.0) * (-1.0);
    dst += texture(tex, uv + vec2(0.0,  -1.0) / 600.0) * (-1.0);
    dst += texture(tex, uv + vec2(1.0,  -1.0) / 600.0) * (-1.0);

    outColor = vec4(dst.rgb, 1.0);
}
`

const gaussianFs = `#version 300 es
precision highp float;
uniform sampler2D tex;
uniform int width;
uniform int height;
in vec2 uv;
out vec4 outColor;
void main(void){
    highp vec4 dst = vec4(0.0);
    dst += texture(tex, uv + vec2(-1.0,  1.0) / 600.0) * 0.0625;
    dst += texture(tex, uv + vec2(0.0,  1.0) / 600.0) * 0.125;
    dst += texture(tex, uv + vec2(1.0,  1.0) / 600.0) * 0.0625;
    dst += texture(tex, uv + vec2(-1.0,  0.0) / 600.0) * 0.125;
    dst += texture(tex, uv + vec2(0.0,  0.0) / 600.0) * 0.25;
    dst += texture(tex, uv + vec2(1.0,  0.0) / 600.0) * 0.125;
    dst += texture(tex, uv + vec2(-1.0,  -1.0) / 600.0) * 0.0625;
    dst += texture(tex, uv + vec2(0.0,  -1.0) / 600.0) * 0.125;
    dst += texture(tex, uv + vec2(1.0,  -1.0) / 600.0) * 0.0625;

    outColor = vec4(dst.rgb, 1.0);
    //outColor = texture(tex, uv);
}
`

const mozaicFs = `#version 300 es
precision highp float;
uniform sampler2D tex;
uniform int width;
uniform int height;
in vec2 uv;
out vec4 outColor;
const highp float grid_size = 8.0;
const highp float grid_size_iter = grid_size - 1.0;
const highp float inv_grid = 0.015625;
void main(void){
    highp vec4 dst = vec4(0.0);
    highp vec2 offset = mod(uv * 600.0, grid_size);
    for(float x = 0.0; x <= grid_size_iter; x += 1.0){
        for(float y = 0.0; y <= grid_size_iter; y += 1.0){
            dst += texture(tex, (uv + vec2(x - offset.s, y - offset.t) / 600.0));
        }
    }
    outColor = vec4(dst.rgb * inv_grid, 1.0);
}
`