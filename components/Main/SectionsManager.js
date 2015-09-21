// компонент, осуществляющий переключение разделов
// В качестве разделов выступают радио-группы
// В качестве модели выступает дерево слоёв

// triggers 'sectionchange'
// options.layersTree
// options.sections
var SectionsManager = L.Class.extend({
    includes: [Backbone.Events],
    initialize: function(options) {
        this.sections = options.sections;
        this.layersTree = options.layersTree;
        this.parentGroup = this._getMutualParent();
        if (!this.parentGroup) {
            throw 'sections must have the same parent group';
        }
        if (!this.parentGroup.get('list')) {
            throw 'sections groups must be radios';
        }
        setTimeout(function() {
            this._triggerChangeEvent();
        }.bind(this), 1);
    },
    setActiveSection: function(sectionName) {
        if (sectionName === this.getActiveSectionName()) {
            return;
        }
        if (!sectionName) {
            this.parentGroup.setNodeVisibility(false);
            return;
        }
        var groupId = this.getGroupIdBySectionName(sectionName);
        if (!groupId) {
            throw 'section does\'nt exist';
        }
        this.layersTree.find(groupId).setNodeVisibility(true);
        this._triggerChangeEvent();
    },
    getActiveSectionName: function() {
        var names = this.getSectionsNames();
        for (var i = 0; i < names.length; i++) {
            var groupId = this.getGroupIdBySectionName(names[i]);
            var group = this.layersTree.find(groupId)
            if (group.get('visible')) {
                return names[i];
            }
        }
        return null;
    },
    getSectionsNames: function() {
        return _.keys(this.sections);
    },
    getSectionSubtree: function(sectionName) {
        return this.layersTree.find(
            this.getGroupIdBySectionName(
                sectionName
            )
        );
    },
    getDataLayer: function(sectionName) {
        return this.getSectionSubtree(sectionName).find(
            this.sections[sectionName].dataLayerId
        );
    },
    getDataLayerId: function(sectionName) {
        return this.getDataLayer(sectionName).get('properties').LayerID;
    },
    getGroupIdBySectionName: function(sectionName) {
        return this.sections[sectionName].groupId;
    },
    _getMutualParent: function() {
        var parent;
        var names = this.getSectionsNames();
        for (var i = 0; i < names.length; i++) {
            var groupId = this.getGroupIdBySectionName(names[i]);
            var group = this.layersTree.find(groupId);
            if (!parent) {
                parent = group.get('parent');
            }
            if (parent.cid !== group.get('parent').cid) {
                return null;
            }
        }
        return parent;
    },
    _triggerChangeEvent: function() {
        this.trigger('sectionchange', this.getActiveSectionName());
    }
})
