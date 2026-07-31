/**
 * This helper takes your raw Cloudinary URL and injects 
 * optimization parameters (resizing, cropping, and quality).
 */
export const getOptimizedImage = (url: string, type: 'card' | 'hero' | 'thumb' = 'card') => {
  if (!url) return '';
  
  // 1. Identify where to inject the parameters
  // Cloudinary URLs look like: .../upload/v12345/folder/image.jpg
  const splitUrl = url.split('/upload/');
  const baseUrl = splitUrl[0] + '/upload/';
  const imagePath = splitUrl[1];

  // 2. Define transformation strings based on the UI needs
  const transformations = (() => {
    switch (type) {
    case 'hero':
      // High quality, wide, optimized for large screens
      return 'c_fill,w_1600,h_900,g_auto,q_auto,f_auto/';
    case 'card':
      // Perfect 3:2 ratio for your grid cards
      return 'c_fill,w_800,h_533,g_auto,q_auto,f_auto/';
    case 'thumb':
      // Small square for search results or footer
      return 'c_fill,w_150,h_150,g_auto,q_auto,f_auto/';
    default:
      return 'q_auto,f_auto/';
    }
  })();

  // 3. Return the modified URL
  return `${baseUrl}${transformations}${imagePath}`;
};
