export { MDX_FIGURE_LIGHTBOX_GALLERY_ID } from './constants'
export { getImageDimensions, getRealImageDimensions, loadImageDimensions } from './dimensions'
export {
  FigureLightboxHost,
  resolveLightboxTrigger,
  type FigureLightboxHostProps,
} from './figure-lightbox-host'
export { FigureLightboxTrigger, type FigureLightboxTriggerProps } from './figure-lightbox-trigger'
export {
  collectFigureLightboxImages,
  isFigureLightboxOpen,
  openFigureLightbox,
} from './open-lightbox'
export {
  PhotoSwipeGallery,
  PhotoSwipeImage,
  usePhotoSwipe,
  type PhotoSwipeGalleryProps,
  type PhotoSwipeImageData,
  type PhotoSwipeImageProps,
} from './photo-swipe'
