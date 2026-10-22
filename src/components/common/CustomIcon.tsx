import React from 'react';

export type IconName =
  | 'home'
  | 'forum'
  | 'activity'
  | 'bookmark'
  | 'bookmark-fill'
  | 'user'
  | 'search'
  | 'filter'
  | 'bell'
  | 'plus'
  | 'close'
  | 'check'
  | 'thumbs-up'
  | 'thumbs-down'
  | 'quote'
  | 'multiquote'
  | 'edit'
  | 'share'
  | 'download'
  | 'download-cloud'
  | 'external-link'
  | 'eye'
  | 'message'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'clock'
  | 'pin'
  | 'lock'
  | 'trash'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'align-left'
  | 'align-center'
  | 'align-right'
  | 'spoiler'
  | 'link'
  | 'image'
  | 'code'
  | 'list'
  | 'upload'
  | 'android'
  | 'flame'
  | 'sparkles'
  | 'settings'
  | 'refresh'
  | 'info';

interface CustomIconProps {
  name: IconName;
  className?: string;
  size?: number | string;
}

export const CustomIcon: React.FC<CustomIconProps> = ({ name, className = 'w-5 h-5', size = 20 }) => {
  const s = typeof size === 'number' ? `${size}px` : size;

  switch (name) {
    case 'home':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M3 10.5L11.2929 3.20711C11.6834 2.81658 12.3166 2.81658 12.7071 3.20711L21 10.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M5 9V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M10 21V14C10 13.4477 10.4477 13 11 13H13C13.5523 13 14 13.4477 14 14V21"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'forum':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M8 12H8.01M12 12H12.01M16 12H16.01"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6547 7.74567 19.0435L3 20L4.29654 16.5426C3.48398 15.2289 3 13.6827 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 8H7C5.89543 8 5 8.89543 5 10V14C5 15.1046 5.89543 16 7 16H17C18.1046 16 19 15.1046 19 14V10C19 8.89543 18.1046 8 17 8Z"
            fill="currentColor"
            fillOpacity="0.15"
          />
        </svg>
      );

    case 'activity':
    case 'flame':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 2C9.5 5.5 13 8 10 11.5C9.5 9.5 8 9 7.5 7.5C5 11 4 14 6 17.5C7.5 20.5 11 22 14 21.5C18 20.5 20 16.5 18.5 13C17 9.5 13 8.5 14.5 5C13.5 4 12.8 3 12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 18C13.6569 18 15 16.6569 15 15C15 13.5 13.8 12.5 12.5 11.5C11.5 13 10.5 14 10.5 15.5C10.5 16.8807 11.1716 18 12 18Z"
            fill="currentColor"
            fillOpacity="0.3"
          />
        </svg>
      );

    case 'sparkles':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M12 3L13.9 8.1L19 10L13.9 11.9L12 17L10.1 11.9L5 10L10.1 8.1L12 3Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.15"
          />
          <path
            d="M19 16L19.9 18.1L22 19L19.9 19.9L19 22L18.1 19.9L16 19L18.1 18.1L19 16Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'bookmark':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M5 5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21L12 17.5L5 21V5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 5H17V17L12 14.5L7 17V5Z"
            fill="currentColor"
            fillOpacity="0.15"
          />
        </svg>
      );

    case 'bookmark-fill':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M5 5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21L12 17.5L5 21V5Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'user':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M20 21C20 17.134 16.4183 14 12 14C7.58172 14 4 17.134 4 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="8" r="3" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case 'search':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <circle cx="11" cy="11" r="5" fill="currentColor" fillOpacity="0.1" />
          <path d="M20 20L16 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'filter':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M4 6H20M7 12H17M10 18H14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'bell':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 10C6 14 4.5 16 4.5 16H19.5C19.5 16 18 14 18 10A6 6 0 0 0 6 10Z"
            fill="currentColor"
            fillOpacity="0.15"
          />
          <path d="M13.73 21A2 2 0 0 1 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'plus':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'close':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'check':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'thumbs-up':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M7 10V20M7 10L11.5 3.5C12 2.8 13.2 2.9 13.5 3.8L14 7H19.5C20.5 7 21.3 7.9 21.1 8.9L19.7 18.9C19.6 19.5 19.1 20 18.5 20H7M7 10H4C3.4 10 3 10.4 3 11V19C3 19.6 3.4 20 4 20H7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="3" y="10" width="4" height="10" rx="1" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case 'thumbs-down':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M7 14V4M7 14L11.5 20.5C12 21.2 13.2 21.1 13.5 20.2L14 17H19.5C20.5 17 21.3 16.1 21.1 15.1L19.7 5.1C19.6 4.5 19.1 4 18.5 4H7M7 14H4C3.4 14 3 13.6 3 13V5C3 4.4 3.4 4 4 4H7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'quote':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M10 11H6C4.89543 11 4 10.1046 4 9V7C4 5.89543 4.89543 5 6 5H8C9.10457 5 10 5.89543 10 7V17C10 18.1046 9.10457 19 8 19H7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M20 11H16C14.8954 11 14 10.1046 14 9V7C14 5.89543 14.8954 5 16 5H18C19.1046 5 20 5.89543 20 7V17C20 18.1046 19.1046 19 18 19H17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'multiquote':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M5 8V18C5 19.1 5.9 20 7 20H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <rect x="7" y="4" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M10 8H16M10 11H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="7" y="4" width="13" height="12" rx="2" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case 'edit':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.15"
          />
        </svg>
      );

    case 'share':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
          <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
          <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" />
        </svg>
      );

    case 'download':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 3V15M12 15L7 10M12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 18V19C4 20.1046 4.89543 21 7 21H17C18.1046 21 20 20.1046 20 19V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'download-cloud':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M6.5 19H17.5C19.9853 19 22 16.9853 22 14.5C22 12.1895 20.2547 10.2854 18 10.0385C17.6052 6.64336 14.7397 4 11.25 4C8.07775 4 5.41872 6.19696 4.67843 9.17293C2.56942 9.69741 1 11.6094 1 13.8889C1 16.7116 3.46243 19 6.5 19Z"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="currentColor"
            fillOpacity="0.1"
          />
          <path d="M12 11V16M12 16L9.5 13.5M12 16L14.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'external-link':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M18 13V19C18 20.1 17.1 21 16 21H5C3.9 21 3 20.1 3 19V8C3 6.9 3.9 6 5 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 3H21V9M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'eye':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.25" />
        </svg>
      );

    case 'message':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M21 11.5C21 16.1944 16.9706 20 12 20C10.4571 20 9.00634 19.6455 7.73891 19.0195L3 20L4.31682 16.4885C3.49129 15.1584 3 13.5901 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'chevron-down':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'chevron-right':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'chevron-left':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'clock':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'pin':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M16 3L21 8L15 14L14 17L7 10L10 9L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 15L4 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'lock':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
          <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2" />
        </svg>
      );

    case 'trash':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M3 6H21M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    // WYSIWYG Icons
    case 'bold':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M6 4H14C16.2091 4 18 5.79086 18 8C18 9.8 16.8 11.3 15.2 11.8C17.4 12.3 19 14.3 19 16.5C19 19 17 21 14.5 21H6V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 12H14.5" stroke="currentColor" strokeWidth="2" />
        </svg>
      );

    case 'italic':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M19 4H10M14 20H5M15 4L9 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'underline':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M6 3V10C6 13.3137 8.68629 16 12 16C15.3137 16 18 13.3137 18 10V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 21H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'strike':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M16 4C14.5 3 12.5 3 11 3.5C8 4.5 7 7 8 9C9 11 11.5 11 13 11.5M4 12H20M9 15C9.5 17.5 11.5 19 13.5 19C16 19 18 17.5 17.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'align-left':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M4 6H20M4 12H14M4 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'align-center':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M4 6H20M7 12H17M5 18H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'align-right':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M4 6H20M10 12H20M6 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'spoiler':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
          <path d="M8 12H16M12 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'link':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M10 13C10.4 13.6 11 14 11.8 14H15C16.7 14 18 12.7 18 11C18 9.3 16.7 8 15 8H11.8C11.1 8 10.4 8.4 10 9M14 11C13.6 10.4 13 10 12.2 10H9C7.3 10 6 11.3 6 13C6 14.7 7.3 16 9 16H12.2C12.9 16 13.6 15.6 14 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'image':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'code':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'list':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M9 6H20M9 12H20M9 18H20M4 6H4.01M4 12H4.01M4 18H4.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'upload':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'android':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M6 10V18C6 19.1 6.9 20 8 20H16C17.1 20 18 19.1 18 18V10" stroke="currentColor" strokeWidth="2" />
          <path d="M7 7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7H7Z" stroke="currentColor" strokeWidth="2" />
          <path d="M5 4L7 6M19 4L17 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="10" cy="5" r="0.8" fill="currentColor" />
          <circle cx="14" cy="5" r="0.8" fill="currentColor" />
        </svg>
      );

    case 'settings':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          <path d="M19.4 15A1.65 1.65 0 0 0 19.7 16.7L20 17.2C20.3 17.7 20.2 18.4 19.7 18.8L18.8 19.7C18.4 20.2 17.7 20.3 17.2 20L16.7 19.7A1.65 1.65 0 0 0 15 19.4V20C15 20.6 14.6 21 14 21H10C9.4 21 9 20.6 9 20V19.4A1.65 1.65 0 0 0 7.3 19.7L6.8 20C6.3 20.3 5.6 20.2 5.2 19.7L4.3 18.8C3.8 18.4 3.9 17.7 4.2 17.2L4.5 16.7A1.65 1.65 0 0 0 4.2 15H3.6C3 15 2.6 14.6 2.6 14V10C2.6 9.4 3 9 3.6 9H4.2A1.65 1.65 0 0 0 4.5 7.3L4.2 6.8C3.9 6.3 4 5.6 4.5 5.2L5.4 4.3C5.8 3.8 6.5 3.9 7 4.2L7.5 4.5A1.65 1.65 0 0 0 9 4.2V3.6C9 3 9.4 2.6 10 2.6H14C14.6 2.6 15 3 15 3.6V4.2A1.65 1.65 0 0 0 16.7 4.5L17.2 4.2C17.7 3.9 18.4 4 18.8 4.5L19.7 5.4C20.2 5.8 20.1 6.5 19.8 7L19.5 7.5A1.65 1.65 0 0 0 19.8 9H20.4C21 9 21.4 9.4 21.4 10V14C21.4 14.6 21 15 20.4 15H19.4Z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );

    case 'refresh':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M21 12A9 9 0 0 0 6 5.3L3 8M3 3V8H8M3 12A9 9 0 0 0 18 18.7L21 16M21 21V16H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'info':
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};
