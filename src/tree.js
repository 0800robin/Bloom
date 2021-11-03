import * as THREE from "three";
import { Branch } from "./branch";
import { maxBranches } from "./utils";

export class Tree extends THREE.Object3D {
  constructor(startingPosition) {
    super();
    this.branches = [];
    this.maxGenerations = 4;
    this.branchMaterial = new THREE.MeshNormalMaterial();


    const trunk = new Branch({
      height: 1,
      material: this.branchMaterial,
      level: 0,
      pos: new THREE.Vector3(startingPosition.x, startingPosition.y, startingPosition.z),
      rotation: new THREE.Euler(0, 0, 0),
      lifespan: 100,
    });

    this.branches.push(trunk);
    this.mesh = trunk.mesh;
  }

  updateBranches() {
    for (let i = this.branches.length - 1; i >= 0; i--) {
      let branch = this.branches[i];
      branch.grow();

      if (branch.timeToBranch() && this.branches.length < maxBranches(this.maxGenerations)) {
        this.branches.push(branch.branch(branch, Math.PI / 8));
        this.branches.push(branch.branch(branch, -Math.PI / 8));
      }
    }
  }
}
