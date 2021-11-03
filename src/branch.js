import  * as THREE from "three";

export class Branch extends THREE.Object3D {
    constructor({
        height, material, pos, level, rotation, lifespan
    }) {
        super();
        this.material = material;
        
        this.level = level;
        this.isGrowing = true;

        this.timer = 0;
        this.lifespan = lifespan;

        this.scalar = 0;
        this.growthRate = 0.01;
        
        this.geometry = new THREE.BoxGeometry(0.1, height, 0.1);
        this.geometry.translate(0, height / 2, 0);

        this.mesh = new THREE.Mesh(this.geometry, material);
        this.mesh.position.copy(pos);
        this.mesh.rotation.copy(rotation);

        this.mesh.scale.setScalar(0);
    }

    grow() {
        this.timer += 1;

        if(!this.fullyGrown() && this.isGrowing) {
            this.scalar += this.growthRate;
            this.mesh.scale.setScalar(this.scalar);
        }
    }

    timeToBranch() {
        if(this.isGrowing && this.fullyGrown()) {
            this.isGrowing = false;
            return true;
        } else {
            return false;
        }
    }

    fullyGrown() {
        return this.timer > this.lifespan;
    }

    branch(parent, angle) {
        const nextBranch = new Branch({
            height: this.geometry.parameters.height * 0.7, 
            material: this.material,
            level: this.level + 1,
            pos: new THREE.Vector3(0, this.geometry.parameters.height, 0),
            rotation: new THREE.Euler(angle, 0, angle),
            lifespan: this.lifespan * 0.97 
        });
        parent.mesh.add(nextBranch.mesh);
        return nextBranch;
    }
}