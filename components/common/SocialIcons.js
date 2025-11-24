import React from 'react';
import { socialIconLocations } from '../../assets/data/dummydata';

// Add keyframes for pulsing animation
const pulseStyle = `
@keyframes pulse {
  0% { transform: scale(1);}
  50% { transform: scale(1.15);}
  100% { transform: scale(1);}
}
`;

const SocialIcons2 = function() {
  var containerStyle = {
    position: 'fixed',
    right: '10px',
    transform: 'translateY(-50%)',
    zIndex: 1000
  };

  // map to React elements without JSX
  var children = socialIconLocations.map(function(icon) {
    return React.createElement(
      'div',
      {
        key: icon.type,
        style: { marginBottom: '5px', padding: '5px', borderRadius: '5px' }
      },
      React.createElement(
        'a',
        {
          id: 's1',
          href: icon.link,
          target: '_blank',
          rel: 'noopener noreferrer',
          style: { display: 'inline-block', animation: 'pulse 1s infinite' }
        },
        icon.img
          ? React.createElement('img', { src: icon.img, alt: icon.type || 'icon', style: { width: 80, height: 80 } })
          : null
      )
    );
  });

  var mediaStyle = `
    @media (max-width: 900px) {
      .social-icons-fixed {
        top: 85% !important;
      }
    }
    @media (min-width: 901px) {
      .social-icons-fixed {
        top: 90% !important; /* moved further down for Windows/desktop mode */
      }
    }
  `;

  return React.createElement(
    React.Fragment,
    null,
    React.createElement('style', null, pulseStyle),
    React.createElement('div', { className: 'social-icons-fixed', style: containerStyle }, children),
    React.createElement('style', null, mediaStyle)
  );
};

export default SocialIcons2;
