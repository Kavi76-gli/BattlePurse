function buildImageUrl(folder, filename) {
  if (!filename) return null;
  return `https://battlepurse-t4yn.onrender.com/uploads/${folder}/${filename}`;
}
