(function() {

  var parameters = PluginManager.parameters('CraftingSystem');

  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === 'CraftingSystem') {
      var action = args[0];

      switch (action) {
        case 'open':
          SceneManager.push(Scene_Crafting);
          break;
        default:
          return;
      }
    }
  };

  function Scene_Crafting() {
    this.initialize.apply(this, arguments);
  }

  Scene_Crafting.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_Crafting.prototype.constructor = Scene_Crafting;

  Scene_Crafting.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
  };

  Scene_Crafting.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this._indexWindow = new Window_CraftingList(0, 0);
    this._indexWindow.setHandler('cancel', this.popScene.bind(this));

    var indexWindowHeight = this._indexWindow.height;
    this.addWindow(this._indexWindow);
  };

  var Window_CraftingList = function() {
    this.initialize.apply(this, arguments);
  }

  Window_CraftingList.prototype = Object.create(Window_Selectable.prototype);
  Window_CraftingList.prototype.constructor = Window_CraftingList;

  Window_CraftingList.lastTopRow = 0;
  Window_CraftingList.lastIndex = 0;

  Window_CraftingList.prototype.initialize = function(x, y) {
    var width = Graphics.boxWidth / 3;
    var height = this.fittingHeight(10);

    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
    this.setTopRow(Window_CraftingList.lastTopRow);
    this.select(Window_CraftingList.lastIndex);
    this.activate();
  }

  Window_CraftingList.prototype.maxCols = function() {
    return 1;
  };

  Window_CraftingList.prototype.maxItems = function() {
    return this._recipesList ? this._recipesList.length : 0;
  }

  Window_CraftingList.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    this.updateStatus();
  };

  Window_CraftingList.prototype.updateStatus = function() {
    if (this._statusWindow) {
      console.log('index: ', this.index());
    }
  };

  // Maps all recipes in the player inventory
  Window_CraftingList.prototype.refresh = function() {
    this._recipesList = [];

    $dataItems.forEach(dataItem => {
      var note = dataItem && dataItem.note;

      if (note) {
        var noteJSON = JSON.parse(note);
        var hasRecipe = Object.keys(noteJSON)[0] === 'recipe';

        if (hasRecipe) {
          var { recipe } = noteJSON;

          // ID of the crafted item
          var itemToCraft = recipe.creates;
          var ingredients =  recipe.ingredients;

          this._recipesList.push({
            itemToCraft,
            ingredients,
          });
        }
      }
    });

    this.createContents();
    this.drawAllItems();
  };

  // Draws each craftable item on the left-top window
  Window_CraftingList.prototype.drawItem = function(index) {
    var itemToCraftID = this._recipesList[index].itemToCraft;
    var rect = this.itemRect(index);

    var width = rect.width - this.textPadding();

    this.drawItemName($dataItems[itemToCraftID], rect.x, rect.y, width);
  };

})();
