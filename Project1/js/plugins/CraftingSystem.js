(() => {

  const parameters = PluginManager.parameters('CraftingSystem');
  const Game_Interpreter_Plugin_Command = Game_Interpreter.prototype.pluginCommand;

  GameInterpreter.prototype.pluginCommand = (command, args) => {

    Game_Interpreter_Plugin_Command.call(this, command, args);

    if (command === 'CraftingSystem') {
      const action = args[0];

      switch (action) {
        case 'open':
          SceneManager.push(Scene_CraftingSystem);
          break;
        default:
          return;
      }
    }
  }

  const Scene_CraftingSystem = () => {
    this.initialize.apply(this, arguments);
  }

  Scene_CraftingSystem.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_CraftingSystem.prototype.constructor = Scene_CraftingSystem;

  Scene_CraftingSystem.prototype.initialize = () => {
    Scene_MenuBase.prototype.initialize.call(this);
  };

  Scene_CraftingSystem.prototype.create = () => {
    Scene_MenuBase.prototype.create.call(this);

    // Index Window
    this._indexWindow = new Window_CraftingSystemIndex(0, 0);
    this._indexWindow.setHandler('cancel', this.popScene.bind(this));

    // Dimensions
    const windowHeight = this._indexWindow.height;
    const boxWidth = Graphics.boxWidth;
    const boxHeight = Graphics.boxHeight - windowHeight;

    // Status Window
    this._statusWindow = new Window_CraftingSystemStatus(
      0, windowHeight, boxWidth, boxHeight
    );

    this.addWindow(this._indexWindow);
    this.addWindow(this._statusWindow);

    this._indexWindow.setStatusWindow(this._statusWindow);
  };

  const Window_CraftingSystemIndex = () => {
    this.initialize.apply(this, arguments);
  }

  Window_CraftingSystemIndex.prototype = Object.create(
    Window_Selectable.prototype
  );
  Window_CraftingSystemIndex.prototype.constructor = Window_CraftingSystemIndex;

  Window_CraftingSystemIndex.lastTopRow = 0;
  Window_CraftingSystemIndex.lastIndex = 0;

  Window_CraftingSystemIndex.prototype.initialize = (x, y) => {
    const width = Graphics.boxWidth;
    const height = this.fittingHeight(6); // arg - number of visible rows
    Window_Selectable.prototype.initialize.call(
      this, x, y, width, height
    );

    this.refresh();
    this.setTopRow(Window_CraftingSystemIndex.lastTopRow);
    this.select(Window_CraftingSystemIndex.lastIndex);
    this.activate();
  };

  Window_CraftingSystemIndex.prototype.maximumColumns = () => {
    return 3;
  };

  Window_CraftingSystemIndex.prototype.maximumItems = () => {
    return this._list
      ? this._list.length
      : 0;
  };


})();
