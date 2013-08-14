/// <reference path="../../../js/jquery.d.ts" />
import baseLeft = require("app/modules/shared/leftPanel");
import utils = require("app/utils");
import tree = require("app/modules/treeViewLeftPanel/treeView");
import thumbs = require("app/modules/treeViewLeftPanel/thumbsView");

export class TreeViewLeftPanel extends baseLeft.LeftPanel {

    $tabs: JQuery;
    $treeButton: JQuery;
    $thumbsButton: JQuery;
    $tabsContent: JQuery;
    $treeView: JQuery;
    $thumbsView: JQuery;
    treeView: tree.TreeView;
    thumbsView: thumbs.ThumbsView;

    constructor($element: JQuery) {
        super($element);
    }

    create(): void {
        
        this.setConfig('treeViewLeftPanel');
        
        super.create();

        this.$tabs = utils.Utils.createDiv('tabs');
        this.$main.append(this.$tabs);

        this.$treeButton = $('<a class="tab first">' + this.content.index + '</a>');
        this.$tabs.append(this.$treeButton);

        this.$thumbsButton = $('<a class="tab">' + this.content.thumbnails + '</a>');
        this.$tabs.append(this.$thumbsButton);

        this.$tabsContent = utils.Utils.createDiv('tabsContent');
        this.$main.append(this.$tabsContent);

        this.$treeView = utils.Utils.createDiv('treeView');
        this.$tabsContent.append(this.$treeView);

        this.$thumbsView = utils.Utils.createDiv('thumbsView');
        this.$tabsContent.append(this.$thumbsView);

        this.$treeButton.on('click', (e) => {
            e.preventDefault();

            this.openTreeView();
        });

        this.$thumbsButton.on('click', (e) => {
            e.preventDefault();

            this.openThumbsView();
        });
    }

    createTreeView(): void {       
        this.treeView = new tree.TreeView(this.$treeView);
    }

    createThumbsView(): void {
        this.thumbsView = new thumbs.ThumbsView(this.$thumbsView);
    }

    toggleComplete(): void {
        super.toggleComplete();

        // if this is the first opening, create tree and thumbs views.
        if (this.isUnopened) {
            this.openTreeView();
        }
    }

    openTreeView(): void {
        if (!this.treeView) {
            this.createTreeView();
        }
        
        this.$treeButton.addClass('on');
        this.$thumbsButton.removeClass('on');

        this.treeView.show();
        if (this.thumbsView) this.thumbsView.hide();
    }

    openThumbsView(): void {
        if (!this.thumbsView) {
            this.createThumbsView();
        }

        this.$treeButton.removeClass('on');
        this.$thumbsButton.addClass('on');

        if (this.treeView) this.treeView.hide();
        this.thumbsView.show();
    }

    resize(): void {
        super.resize();

        this.$tabsContent.actualHeight(this.$main.height() - this.$tabs.outerHeight());
    }
}