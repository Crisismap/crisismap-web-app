// Компонент, для управления переключения разделами.
// Каждому разделу соответствует дочерняя группа дерева sectionsTree
// Все дочерние элементы sectionsTree должны быть группами и у них
// обязательно должен быть тип radio. Id раздела === Id группы
// В качестве модели выступает дерево слоёв, т.е. при изменении видимости
// групп изменится и активный раздел. Однако даже если группа будет выключена,
// то SectionsManager закеширует последний выбранный раздел и при запросе
// активного раздела вернёт его.
// В случае если изначально все группы выключены, SectionsManager вернёт
// пустой раздел (id _empty)
// У раздела есть три свойства, которые можно получить путём вызова метода
// getSectionProperties(): id, title и dataLayerId
// title берётся из названия группы
// dataLayerId - это id того слоя группы, у которого есть мета-свойство data_provider

var nsGmx = nsGmx || {};

// triggers sectionchange
// options.sectionsTree
nsGmx.SectionsManager = L.Class.extend({
    includes: [Backbone.Events],

    initialize: function(options) {
        L.setOptions(this, options);
        this.sectionsTree = options.sectionsTree;
        if (!this.sectionsTree.get('list')) {
            throw 'sections groups must be radios';
        }
        this._checkSections();
        this._bindGroupEvents();
        // cache
        this._sections = {
            '_empty': {
                id: '_empty',
                title: nsGmx.Translations.getText('crisismap.section.empty'),
                dataLayerId: '',
                tree: null
            }
        };
        this._activeSectionId = '_empty';
    },

    getSectionsIds: function() {
        if (!this._sectionsIds) {
            this._sectionsIds = [];
            this.sectionsTree.get('childrenNodes').each(function(model) {
                this._sectionsIds.push(model.get('properties').GroupID);
            }.bind(this));
        }
        return this._sectionsIds;
    },

    setActiveSectionId: function(sectionId) {
        sectionId = sectionId || '_empty';
        if (sectionId === '_empty') {
            this.sectionsTree.setNodeVisibility(false);
        } else {
            this.sectionsTree.find(sectionId).setNodeVisibility(true);
        }
    },

    getActiveSectionId: function() {
        var group = this._getActiveSection();
        if (group) {
            var id = group.get('properties').GroupID;
            this._activeSectionId = id;
            return id;
        } else {
            return this._activeSectionId;
        }
    },

    getSectionProperties: function(sectionId) {
        if (!this._sections[sectionId]) {
            var section = this.sectionsTree.find(sectionId);
            this._sections[sectionId] = {
                id: sectionId,
                title: section.get('properties').title,
                dataLayersIds: this._getDataLayersIds(sectionId),
                tree: section,
                icon: this.options.sectionsIcons[sectionId]
            }
        }
        return this._sections[sectionId];
    },

    _checkSections: function() {
        var sections = this.getSectionsIds();
        for (var i = 0; i < sections.length; i++) {
            var group = this.sectionsTree.find(sections[i]);
            if (!group.get('properties').GroupID) {
                throw 'sections must be groups';
            }
        }
    },

    _bindGroupEvents: function() {
        var sections = this.getSectionsIds();
        for (var i = 0; i < sections.length; i++) {
            var group = this.sectionsTree.find(sections[i]);
            group.on('change:visible', function(model, visible) {
                if (visible) {
                    this.trigger('sectionchange', model.get('properties').GroupID);
                }
            }.bind(this))
        }
    },

    _getActiveSection: function() {
        var activeSectionId = null;
        var sections = this.getSectionsIds();
        for (var i = 0; i < sections.length; i++) {
            var group = this.sectionsTree.find(sections[i]);
            if (group.get('visible')) {
                return group;
            }
        }
        return null;
    },

    _getDataLayersIds: function(sectionId) {
        var dataLayers = this._getDataLayers(sectionId);
        return dataLayers.map(function(dataLayer) {
            return dataLayer.get('properties').LayerID;
        });
    },

    _getDataLayers: function(sectionId) {
        var dataLayers = [];
        var group = this.sectionsTree.find(sectionId);
        // выбираем слои, у которых в мета-данных есть
        // свойство data_provider
        group.eachNode(function(model) {
            var mp = model.get('properties').MetaProperties;
            if (mp && mp['data_provider']) {
                dataLayers.push(model);
            }
        });
        return dataLayers;
    }
});

nsGmx.Translations.addText('rus', {
    'crisismap.section.empty': 'Раздел не выбран'
});

nsGmx.Translations.addText('eng', {
    'crisismap.section.empty': 'Section is not selected'
});
