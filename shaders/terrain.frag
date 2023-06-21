#version 330

uniform mat3 m_normal;
uniform mat4 m_pvm, m_view;
uniform sampler2D midTex, midNorm, highTex, highNorm, lowTex, lowNorm, waterTex, waterNorm;
uniform sampler2D midTex2, midNorm2, highTex2, highNorm2, lowTex2, lowNorm2, waterTex2, waterNorm2;
uniform sampler2D midTex3, midNorm3, lowTex3, lowNorm3;
uniform float textureMix, nTextures, highLimit, lowLimit, waterHeight, Normals;
uniform int scene; 
uniform	vec4 ambient;
uniform vec4 l_dir;

in vec2 tc;
in vec3 n;
in vec4 pos;

out vec4 colorOut;

void main() {

    // normalize vectors
	vec3 normal = normalize(n);
	vec3 l = normalize(vec3(m_view * -l_dir));
	vec2 texc = tc * nTextures;

	vec4 thismidTex, thismidNorm, thisHighTex, thisHighNorm, thisLowTex, thisLowNorm,thisWaterTex, thisWaterNorm;
	if(scene == 0){
		thisWaterTex = texture(lowTex,texc);
		thisWaterNorm = texture(lowNorm,texc);
		thismidTex = texture(midTex,texc);
		thismidNorm = texture(midNorm,texc);
		thisHighTex = texture(highTex,texc);
		thisHighNorm = texture(highNorm,texc);
		thisLowTex = texture(lowTex,texc);
		thisLowNorm = texture(lowNorm,texc);

	}else if(scene == 1){
		thisWaterTex = texture(waterTex2,texc);
		thisWaterNorm = texture(waterNorm2,texc);
		thismidTex = texture(midTex2,texc);
		thismidNorm = texture(midNorm2,texc);
		thisHighTex = texture(highTex2,texc);
		thisHighNorm = texture(highNorm2,texc);
		thisLowTex = texture(lowTex2,texc);
		thisLowNorm = texture(lowNorm2,texc);
	}

	else{
		thisWaterTex = texture(lowTex3,texc);
		thisWaterNorm = texture(lowNorm3,texc);

		thismidTex = texture(midTex3,texc);
		thismidNorm = texture(midNorm3,texc);

		thisHighTex = texture(midTex3,texc);
		thisHighNorm = texture(midNorm3,texc);

		thisLowTex = texture(lowTex3,texc);
		thisLowNorm = texture(lowNorm3,texc);
	}

	
	vec4 texColor;
	float deviation = 0.5;
	
	if(pos.y <= waterHeight + deviation){


		float f = smoothstep(0.0, deviation, waterHeight + deviation - pos.y);

		texColor = mix(thisLowTex,thisWaterTex,f);

		// get texture normals
		vec3 lowNorm = Normals * normalize(m_normal * vec3(thisLowNorm));
		vec3 waterNorm = Normals * normalize(m_normal * vec3(thisWaterNorm));

		normal = normalize(normal + mix(lowNorm, waterNorm, f));

	}else{

		float f = smoothstep(-textureMix, textureMix, highLimit - pos.y);
		texColor = mix(thisHighTex,thismidTex,f);
		float f2 = 0;
		if(f == 1){	
			f2 = smoothstep(-(textureMix/2), (textureMix/2), lowLimit - pos.y);
			texColor = mix(thismidTex, thisLowTex, f2);
		}

		// get texture normals
		vec3 lowNorm = Normals * normalize(m_normal * vec3(thisLowNorm));
		vec3 midNorm = Normals * normalize(m_normal * vec3(thismidNorm));
		vec3 highNorm =	Normals * normalize(m_normal * vec3(thisHighNorm));

		vec3 normalMix = mix(highNorm, midNorm, f);
		if(f == 1){
			normalMix = mix(normalMix, lowNorm, f2);
		}
			
		normal = normalize(normal + normalMix);
		
	}
	
		
	float intensity = ambient.x + max(dot(normal,l), 0.0);

    texColor = intensity * texColor;
    colorOut = texColor;


}