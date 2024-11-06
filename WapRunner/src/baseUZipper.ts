import zipper from "7zip-min";

export const zz = {
  unpack: zipper.unpack,
  pack: zipper.pack,
  list: zipper.list,
  cmd: zipper.cmd,
  zz: zipper,
};

export default zz;
