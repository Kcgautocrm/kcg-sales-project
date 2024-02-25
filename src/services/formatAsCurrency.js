export default function formatAsCurrency(x) {
  if (!x) {
    return ""
  };
  x = x.toString().replace(/,/g, '');
  return `₦${x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}