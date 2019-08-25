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

    // Crafting List Window
    this._indexWindow = new Window_CraftingList(0, 0);
    this._indexWindow.setHandler('cancel', this.popScene.bind(this));

    // Ingredients List Window
    var wy = this._indexWindow.height;
    var ww = Graphics.boxWidth;
    var wh = Graphics.boxHeight - wy;

    this._statusWindow = new Window_Ingredients_List(0, wy, ww, wh);
    this.addWindow(this._indexWindow);
    this.addWindow(this._statusWindow);
    this._indexWindow.setStatusWindow(this._statusWindow);
  };

  // Available craftable items
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
      var item = this._recipesList[this.index()];
      this._statusWindow.setItem(item);
    }
  };

  Window_CraftingList.prototype.setStatusWindow = function(statusWindow) {
    this._statusWindow = statusWindow;
    this.updateStatus();
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

  // Required ingredients for each item
  var Window_Ingredients_List = function() {
    this.initialize.apply(this, arguments);
  }

  Window_Ingredients_List.prototype = Object.create(Window_Base.prototype);
  Window_Ingredients_List.prototype.constructor = Window_Ingredients_List;

  Window_Ingredients_List.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(
      this, x, y, width, height,
    );
  }

  Window_Ingredients_List.prototype.setItem = function(item) {
    console.log('window set item ITEM: ', item);

    if (this._item !== item) {
        this._item = item;
        this.refresh();
    }
  };

  Window_Ingredients_List.prototype.refresh = function() {
    var item = this._item;
    var x = 0;
    var y = 0;
    var lineHeight = this.lineHeight();
    this.contents.clear();

    console.log('item: ', item)

    if (!item) {
      return;
    }
    //this.drawItemName(item, x, y);

    var self = this;
    item.ingredients.forEach(function(ingredientID) {
      var ingredient = $dataItems[ingredientID];

      self.drawItemName(ingredient, x, y);
      x = self.textPadding();
      y = lineHeight + self.textPadding();
    });
  };

  

})();
