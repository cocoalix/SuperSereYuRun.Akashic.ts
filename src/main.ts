import createTitleScene from './scene/title';

function main(param: g.GameMainParameterObject): void {
    g.game.pushScene(createTitleScene());
}

export = main;
