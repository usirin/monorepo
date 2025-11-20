import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import type { VoxelData } from "../types";

interface VoxelRendererProps {
	voxels: VoxelData[];
}

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

export const VoxelRenderer: React.FC<VoxelRendererProps> = ({ voxels }) => {
	const meshRef = useRef<THREE.InstancedMesh>(null);

	useEffect(() => {
		if (!meshRef.current) return;

		// Update instances
		voxels.forEach((voxel, i) => {
			tempObject.position.set(voxel.x, voxel.y, voxel.z);
			tempObject.updateMatrix();
			meshRef.current!.setMatrixAt(i, tempObject.matrix);
			
			tempColor.setHex(voxel.color);
			meshRef.current!.setColorAt(i, tempColor);
		});

		meshRef.current.instanceMatrix.needsUpdate = true;
		if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
	}, [voxels]);

	return (
		<instancedMesh
			ref={meshRef}
			args={[undefined, undefined, voxels.length]}
		>
			<boxGeometry args={[1, 1, 1]} />
			<meshStandardMaterial />
		</instancedMesh>
	);
};
