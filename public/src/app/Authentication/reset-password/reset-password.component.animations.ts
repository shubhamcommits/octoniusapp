import {animate, keyframes, state, style, transition, trigger} from "@angular/animations";

export const rotateIn = trigger('rotateIn', [
  state('mid', style({
    transform: 'translateY(-20%)'
  })),
  state('end', style({
    transform: 'translateY(0)'
  })),
  transition('void => mid', [
    animate(1000, keyframes([
      style({transform: 'translateY(100%) rotateY(180deg)', opacity: 0, offset: 0}),
      style({transform: 'translateY(40%) rotateY(280deg)', opacity: 0.33, offset: 0.33}),
      style({transform: 'translateY(0) rotateY(330deg)', opacity: 0.66, offset: 0.66}),
      style({transform: 'translateY(-20%) rotateY(360deg)', opacity: 1, offset: 1})
    ]))
  ]),
  transition('mid => *', [
    animate(1000, keyframes([
      style({transform: 'translateY(-20%)', offset: 0}),
      style({transform: 'translateY(-10%)', offset: 0.66}),
      style({transform: 'translateY(-5%)', offset: 0.90}),
      style({transform: 'translateY(0%)', offset: 1})
    ]))
  ])
]);

export const fadeIn = trigger('fadeIn', [
    state('invisible', style({
      opacity: 0
    })),
    state('visible', style({
      opacity: 1
    })),
    transition('invisible => visible', [
      animate(1000)
    ])
  ]);
