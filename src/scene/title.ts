import createGameScene from './game';

const createTitleScene = () => {
    const scene = new g.Scene({game: g.game});
    const font = new g.DynamicFont({
        game: g.game,
        fontFamily: "sans-serif",
        size: 15
    });

    scene.onLoad.add(() => {
        const backgroundRect = new g.FilledRect({
            scene: scene,
            cssColor: "#036ffc",
            width: g.game.width,
            height: g.game.height,
            x: 0,
            y: 0,
        });
        const titlePrefixLabel = new g.Label({
            scene: scene,
            font: font,
            text: "セレゆげーむ その1",
            fontSize: 24,
            textColor: "#fff",
            x: 100,
            y: g.game.height / 2 - 100,
        });
        const titleLabel = new g.Label({
            scene: scene,
            font: font,
            text: "スーパーセレゆラン！",
            fontSize: 36,
            textColor: "#fff",
            x: 0,
            y: g.game.height / 2 - 50,
        });
        const touchStartLabel = new g.Label({
            scene: scene,
            font: font,
            text: "TOUCH START",
            fontSize: 24,
            textColor: "#fff",
            x: 100,
            y: g.game.height / 2,
        });
        backgroundRect.touchable = true;
        backgroundRect.pointDown.add(() => {
            g.game.replaceScene(createGameScene());
        });

        scene.append(backgroundRect);
        scene.append(titlePrefixLabel);
        scene.append(titleLabel);
        scene.append(touchStartLabel);
    });

    return scene;
}

export default createTitleScene;
