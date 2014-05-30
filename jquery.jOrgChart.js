/**
 * jQuery org-chart/tree plugin.
 *
 * Author: keitsi
 * http://www.diandian.com/dianlog/keitsi
 *
 * Based on the work of Wes Nolte and Mark Lee
 * http://twitter.com/wesnolte
 * http://www.capricasoftware.co.uk 
 *
 * Copyright (c) 2014 keitsi
 * Dual licensed under the MIT and GPL licenses.
 *
 */
(function ($) {
    var $nodeCount = 0;
    var $jOrgChart = null;
    var $chartRoot = null;

    $.widget("jquery.jOrgChart",
    {
        // default options
        options: {
            chartElement: 'body',
            depth: -1,
            chartClass: "jOrgChart",
            dragAndDrop: true
        },

        // the constructor
        _create: function () {
            //opts = this.options;
            $jOrgChart = this;
            $chartRoot = this.element;

            this.buildChart($jOrgChart.options.jsonData);
        },

        // called when created, and later when changing options
        _refresh: function () {
        },

        // events bound via _on are removed automatically
        // revert other modifications here
        _destroy: function () {
            $("#orgList").remove();
            $chartRoot.children().remove();
        },

        // _setOptions is called with a hash of all options that are changing
        // always refresh when changing options
        _setOptions: function () {
            // _super and _superApply handle keeping the right this-context
            //this._superApply(arguments);
            this._refresh();
        },

        // _setOption is called for each individual option that is changing
        _setOption: function (key, value) {
            this._super(key, value);
            this._refresh();
        },

        //build list
        buildList: function (parentElement, parentKey, jsonData) {
            var elements = [];

            $.each(jsonData, function (i, n) {
                if (n.parent == parentKey) {
                    elements.push(n);
                }
            });

            if (elements.length > 0) {
                var ul;
                if (parentKey == 0) {
                    ul = parentElement;
                }
                else {
                    ul = $("<ul>").appendTo(parentElement);
                }

                $.each(elements, function (i, n) {
                    var li = $("<li id='#" + n.key + "'>")
                        .text(n.name)
                        .attr("name", n.name)
                        .attr("code", n.code)
                        .attr("key", n.key)
                        .attr("parent", n.parent)
                        .appendTo(ul);

                    $jOrgChart.buildList(li, n.key, jsonData);
                });
            }
        },
        //build chart
        buildChart: function (jsonData) {
            // build org list if is first build
            if (!$("#orgList").is("ul")) {
                $("<ul id='orgList'>")
                    .css("display", "none")
                    .appendTo("body");
                this.buildList($("#orgList"), 0, jsonData)
            }

            // build the tree
            $this = $("#orgList");
            var $container = $("<div class='" + $jOrgChart.options.chartClass + "'/>");
            if ($this.is("ul")) {
                this.buildNode($this.find("li:first"), $container, 0, $jOrgChart.options);
            }
            else if ($this.is("li")) {
                this.buildNode($this, $container, 0, $jOrgChart.options);
            }
            $chartRoot.append($container);

            // add drag and drop if enabled
            if ($jOrgChart.options.dragAndDrop) {
                $('div.node').draggable({
                    cursor: 'move',
                    distance: 40,
                    helper: 'clone',
                    opacity: 0.8,
                    revert: 'invalid',
                    revertDuration: 100,
                    snap: 'div.node.expanded',
                    snapMode: 'inner',
                    stack: 'div.node'
                });

                $('div.node').droppable({
                    accept: '.node',
                    activeClass: 'drag-active',
                    hoverClass: 'drop-hover'
                });

                // Drag start event handler for nodes
                $('div.node').bind("dragstart", function handleDragStart(event, ui) {

                    var sourceNode = $(this);
                    sourceNode.parentsUntil('.node-container')
                               .find('*')
                               .filter('.node')
                               .droppable({ disabled: true });
                });

                // Drag stop event handler for nodes
                $('div.node').bind("dragstop", function handleDragStop(event, ui) {

                    /* reload the plugin */
                    //$(opts.chartElement).children().remove();
                    $chartRoot.children().remove();
                    //jOrgChart.clear();
                    $jOrgChart.buildChart($jOrgChart.options);
                });

                // Drop event handler for nodes
                $('div.node').bind("drop", function handleDropEvent(event, ui) {

                    var targetID = $(this).data("tree-node");
                    var targetLi = $this.find("li").filter(function () { return $(this).data("tree-node") === targetID; });
                    var targetUl = targetLi.children('ul');

                    var sourceID = ui.draggable.data("tree-node");
                    var sourceLi = $this.find("li").filter(function () { return $(this).data("tree-node") === sourceID; });
                    var sourceUl = sourceLi.parent('ul');

                    //change source li's parent
                    sourceLi.attr("parent", targetLi.attr("key"));

                    if (targetUl.length > 0) {
                        targetUl.append(sourceLi);
                    } else {
                        targetLi.append("<ul></ul>");
                        targetLi.children('ul').append(sourceLi);
                    }

                    //Removes any empty lists
                    if (sourceUl.children().length === 0) {
                        sourceUl.remove();
                    }

                }); // handleDropEvent

            } // Drag and drop
        },
        // Method that recursively builds the tree
        buildNode: function ($node, $chartRoot, level, opts) {
            var $table = $("<table cellpadding='0' cellspacing='0' border='0'/>");
            var $tbody = $("<tbody/>");

            // Construct the node container(s)
            var $nodeRow = $("<tr/>").addClass("node-cells");
            var $nodeCell = $("<td/>").addClass("node-cell").attr("colspan", 2);
            var $childNodes = $node.children("ul:first").children("li");
            var $nodeDiv;

            if ($childNodes.length > 1) {
                $nodeCell.attr("colspan", $childNodes.length * 2);
            }
            // Draw the node
            // Get the contents - any markup except li and ul allowed
            var $nodeContent = $node.clone()
                                    .children("ul,li")
                                    .remove()
                                    .end()
                                    .html();
            var $code = $node.clone()
                                    .children("ul,li")
                                    .remove()
                                    .end()
                                    .attr("code");

            //Increaments the node count which is used to link the source list and the org chart
            $nodeCount++;
            $node.data("tree-node", $nodeCount);
            $nodeDiv = $("<div>").addClass("node")
                                             .data("tree-node", $nodeCount);
            //append node name
            $("<div>").addClass("node-name").append($nodeContent).appendTo($nodeDiv);
            //append node code
            $("<div>").addClass("node-code").append($code).appendTo($nodeDiv);

            // Expand and contract nodes
            if ($childNodes.length > 0) {
                $nodeDiv.click(function () {
                    var $this = $(this);
                    var $tr = $this.closest("tr");

                    if ($tr.hasClass('contracted')) {
                        $this.css('cursor', 'n-resize');
                        $tr.removeClass('contracted').addClass('expanded');
                        $tr.nextAll("tr").css('visibility', '');

                        // Update the <li> appropriately so that if the tree redraws collapsed/non-collapsed nodes
                        // maintain their appearance
                        $node.removeClass('collapsed');
                    } else {
                        $this.css('cursor', 's-resize');
                        $tr.removeClass('expanded').addClass('contracted');
                        $tr.nextAll("tr").css('visibility', 'hidden');

                        $node.addClass('collapsed');
                    }
                });
            }

            $nodeCell.append($nodeDiv);
            $nodeRow.append($nodeCell);
            $tbody.append($nodeRow);

            if ($childNodes.length > 0) {
                // if it can be expanded then change the cursor
                $nodeDiv.css('cursor', 'n-resize');

                // recurse until leaves found (-1) or to the level specified
                if (opts.depth == -1 || (level + 1 < opts.depth)) {
                    var $downLineRow = $("<tr/>");
                    var $downLineCell = $("<td/>").attr("colspan", $childNodes.length * 2);
                    $downLineRow.append($downLineCell);

                    // draw the connecting line from the parent node to the horizontal line 
                    $downLine = $("<div></div>").addClass("line down");
                    $downLineCell.append($downLine);
                    $tbody.append($downLineRow);

                    // Draw the horizontal lines
                    var $linesRow = $("<tr/>");
                    $childNodes.each(function () {
                        var $left = $("<td>&nbsp;</td>").addClass("line left top");
                        var $right = $("<td>&nbsp;</td>").addClass("line right top");
                        $linesRow.append($left).append($right);
                    });

                    // horizontal line shouldn't extend beyond the first and last child branches
                    $linesRow.find("td:first")
                                .removeClass("top")
                             .end()
                             .find("td:last")
                                .removeClass("top");

                    $tbody.append($linesRow);
                    var $childNodesRow = $("<tr/>");
                    $childNodes.each(function () {
                        var $td = $("<td class='node-container'/>");
                        $td.attr("colspan", 2);
                        // recurse through children lists and items
                        $jOrgChart.buildNode($(this), $td, level + 1, opts);
                        $childNodesRow.append($td);
                    });

                }
                $tbody.append($childNodesRow);
            }

            // any classes on the LI element get copied to the relevant node in the tree
            // apart from the special 'collapsed' class, which collapses the sub-tree at this point
            if ($node.attr('class') != undefined) {
                var classList = $node.attr('class').split(/\s+/);
                $.each(classList, function (index, item) {
                    if (item == 'collapsed') {
                        console.log($node);
                        $nodeRow.nextAll('tr').css('visibility', 'hidden');
                        $nodeRow.removeClass('expanded');
                        $nodeRow.addClass('contracted');
                        $nodeDiv.css('cursor', 's-resize');
                    } else {
                        $nodeDiv.addClass(item);
                    }
                });
            }

            $table.append($tbody);
            $chartRoot.append($table);

            /* Prevent trees collapsing if a link inside a node is clicked */
            $nodeDiv.children('a').click(function (e) {
                console.log(e);
                e.stopPropagation();
            });
        },
        jsonData: function (jsonData) {
            if (jsonData != undefined) {
                $("#orgList").remove();
                $chartRoot.children().remove();
                this.buildChart(jsonData);
            }
            else {
                var objList = [];
                $("#orgList li").each(function (index) {
                    if ($(this).is("li")) {
                        var obj = {};
                        obj.name = $(this).attr("name");
                        obj.code = $(this).attr("code");
                        obj.key = $(this).attr("key");
                        obj.parent = $(this).attr("parent");
                        objList.push(obj);
                    }
                });

                var jsonData = JSON.stringify(objList);
                return jsonData;
            }
        },
        clear: function () {
            $("#orgList").remove();
            $chartRoot.children().remove();
        }
    });
})(jQuery);
