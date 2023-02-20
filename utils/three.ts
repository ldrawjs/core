export default function three() {
  return import("https://esm.sh/three")
    .then((
      {
        BufferGeometry,
        Group,
        Line,
        LineBasicMaterial,
        Matrix4,
        Mesh,
        MeshBasicMaterial,
        Vector3,
      },
    ) => ({
      BufferGeometry,
      Group,
      Line,
      LineBasicMaterial,
      Matrix4,
      Mesh,
      MeshBasicMaterial,
      Vector3,
    }));
}
