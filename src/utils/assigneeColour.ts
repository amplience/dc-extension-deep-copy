import md5 from 'md5';
import { UserInterface } from '../../types/types';

const colours = [
  'rgb(63,152,134)',
  'rgb(100,190,225)',
  'rgb(25,195,151)',
  'rgb(126,224,216)',
  'rgb(198,78,103)',
  'rgb(240,110,170)',
  'rgb(205,154,195)',
  'rgb(255,167,124)',
  'rgb(52,87,101)',
  'rgb(144,90,159)',
  'rgb(198,156,84)',
  'rgb(192,192,48)',
  'rgb(0,67,115)',
  'rgb(101,87,77)',
  'rgb(113,114,153)',
  'rgb(164,164,164)',
  'rgb(182,216,227)',
  'rgb(210, 141, 136)',
  'rgb(190, 220, 132)',
  'rgb(242, 189, 87)',
  'rgb(230, 228, 117)',
  'rgb(110, 137, 151)',
  'rgb(137, 162, 212)',
  'rgb(201, 196, 212)',
];

export const getColour = (user: UserInterface) => {
  if (!user || !user.email) {
    return '#999';
  }
  const hash = md5(user.email);
  const numFromHash = parseInt(hash.replace(/[^\d]+/, ''), 10);
  return colours[numFromHash % colours.length];
};
