import Binding from './../binding';

var mainarea = null;

export default class Gui {
    binding: Binding;

    constructor(binding: Binding) {
        this.binding = binding;
    }

    start(binding: Binding){
        LiteGUI.init(); 

        var mainmenu = new LiteGUI.Menubar("mainmenubar");
        LiteGUI.add( mainmenu );

        mainarea = new LiteGUI.Area({ id: "mainarea", content_id:"canvasarea", height: "calc( 100% - 20px )", main:true, inmediateResize: true});
        LiteGUI.add( mainarea );

        mainarea.onresize = function() { };

        this.createSidePanel(this.binding);

        mainarea.getSection(0).split("vertical",[null,"250px"],true);
        mainarea.getSection(0).getSection(0).split("horizontal",[null,"600px"],true);

        this.createCanvas();

        mainarea.getSection(0).onresize = function() {};

        var docked_bottom = new LiteGUI.Panel({ id: "bottom_panel", title:"Docked panel",hide:true});
        mainarea.getSection(0).getSection(1).add( docked_bottom );
        LiteGUI.bind( docked_bottom,"closed",function() { LiteGUI.mainarea.getSection(0).merge() });

        var dialog = this.createWidgetsDialog(this.binding);
        var dialog2 = this.createTableDialog();
        var dialog3 = this.createComplexListDialog();

        mainmenu.add("File/Parminder");
        mainmenu.add("File/new");
        mainmenu.add("File/open");
        mainmenu.add("File/save");
        mainmenu.add("Edit/undo");
        mainmenu.add("Edit/redo");
        mainmenu.add("Edit/");
        mainmenu.add("Edit/copy", { callback: function(){ console.log("COPY"); } });
        mainmenu.add("Edit/paste");
        mainmenu.add("Edit/clear");
            
        mainmenu.add("View/bottom panel", { callback: function() { docked_bottom.show(); } });
        mainmenu.add("View/fixed size", { callback: function() { LiteGUI.setWindowSize(1000, 600); } });
        mainmenu.add("View/");
        mainmenu.add("View/side panel", { callback: function() { this.createSidePanel(this.binding); } });
        mainmenu.add("View/maximize", { callback: function() { LiteGUI.setWindowSize(); } });

        mainmenu.add("Vertex-Count/1000", { callback: function() {
            binding.vextexCount = 1000; 
            LiteGUI.showMessage("Setting Vertex Count to 1000.");
        }});
        mainmenu.add("Vertex-Count/50000", { callback: function() {
            binding.vextexCount = 50000; 
            LiteGUI.showMessage("Setting Vertex Count to 50000.");
        }});
        mainmenu.add("Vertex-Count/Quater Million 250000", { callback: function() {
            binding.vextexCount = 250000; 
            LiteGUI.showMessage("Setting Vertex Count to 250000.");
        }});
        mainmenu.add("Vertex-Count/Half Million(500000)", { callback: function() {
            binding.vextexCount = 500000; 
            LiteGUI.showMessage("Setting Vertex Count to 500000.");
        }});
    }

    createCanvas()
    {
        // Create canvas 1
        var canvas = document.createElement("canvas");
        canvas.id = 'webgpu-canvas';
        canvas.width = 630; // 800
        canvas.height = 640;

        canvas.redraw = function() {
			var rect = canvas.parentNode.getClientRects()[0];
            canvas.width = rect.width > 630 ? 630 : rect.width;
            canvas.height = rect.height > 640 ? 640 : rect.height;
        }
		
        mainarea.getSection(0).getSection(0).getSection(0).onresize = function() { canvas.redraw(); };
        mainarea.getSection(0).getSection(0).getSection(0).content.appendChild(canvas);

        // Create canvas 2
        var canvas2 = document.createElement("canvas");
        canvas2.id = 'webgpu-canvas2';
        canvas2.width = 630;
        canvas2.height = 640;

        canvas2.redraw = function() {
			var rect = canvas2.parentNode.getClientRects()[0];
            canvas2.width = rect.width > 630 ? 630 : rect.width;
            canvas2.height = rect.height > 640 ? 640 : rect.height;
		}
		mainarea.getSection(0).getSection(0).getSection(1).onresize = function() { canvas2.redraw(); };
        mainarea.getSection(0).getSection(0).getSection(1).content.appendChild(canvas2);
    }

    createSidePanel(binding: Binding)
    {
        mainarea.split("horizontal",[null,340],true);

        var docked = new LiteGUI.Panel("right_panel", {title:'Docked panel', close: true});
        mainarea.getSection(1).add( docked );

        //docked.dockTo( mainarea.getSection(1).content,"full");
        //docked.show();
        LiteGUI.bind( docked, "closed", function() { mainarea.merge(); });

        window.sidepanel = docked;

        this.updateSidePanel( docked, binding );
    }

    updateSidePanel( root, binding: Binding )
    {
        root = root || window.sidepanel;
        root.content.innerHTML = "";

        //tabs 
        var tabs_widget = new LiteGUI.Tabs();
        tabs_widget.addTab("ViewerApp");
        tabs_widget.addTab("Introspector",{selected:true, width: "100%", height: 200});
        tabs_widget.addTab("Extra");

        tabs_widget.getTabContent("ViewerApp").appendChild( LiteGUI.createElement( "strong",null,"Viewer-App") );

        // A dummy tree show
        var mytree = { id: "System Health Message", 
                children: [
                    { id: "Frequency: 5" },
                    { id: "Number of messages: 2" },
                    { id: "Time Stamp: 2021/6/6 12:48:31.999", 
                        children: [
                            { id: "ID: 01" },
                            { id: "Data: 1", 
                                children: [
                                    { id: "value: " },
                                ] 
                            }
                        ]},
                    { id: "Time Stamp: 2021/6/6 12:49:32.8", 
                        children: [
                            { id: "ID: 02" },
                            { id: "Data: 2", 
                                children: [
                                    { id: "valee: " },
                                ] 
                            }
                        ]},
                ]};

        var litetree = new LiteGUI.Tree( mytree, { allow_rename: true });
        LiteGUI.bind( litetree.root, "item_selected", function(e) {
            console.log("Node selected: ", e.detail); 
        });
        var tree_tab_content = tabs_widget.getTabContent("Introspector");
        tree_tab_content.appendChild( litetree.root )

        litetree.insertItem( {id:"FOO"}, "Child2",2 );
        //litetree.removeItem( "SubChild1" );
        //litetree.moveItem( "FOO", "Child3" );
        litetree.insertItem( {id:"MAX"}, "Child1" );
        root.add( tabs_widget );

        //side panel widget
        var widgets = new LiteGUI.Inspector();
        widgets.onchange = function(name,value,widget) {
            console.log("Widget change: " + name + " -> " + value );
        };
        root.content.appendChild(widgets.root);
        widgets.addSlider("Vertex count",15,{min:1,max:500000,step:1, empadding: "10", callback: function(x : number) { binding.vextexCount = Math.floor(x);; }});
        widgets.addSeparator();
        widgets.addVector2("vector2",[10,20], {min:0});
        widgets.addVector3("vector3",[10,20,30], {min:0});
        widgets.addVector4("vector4",[0.1,0.2,0.3,0.4], {min:0});

        widgets.addSection("Scene Camera Controller");
        widgets.addCheckbox("checkbox",true,{callback: function(value) { console.log("Checkbox pressed: " + value); } });
        widgets.addButton("Serialize","Save",{callback: function(name) { console.log("Button pressed: " + name); } });
        widgets.addButtons("Serialize",["Save","Load","New"],{callback: function(name) { console.log("Button pressed: " + name); } });
        widgets.addButton(null,"Save");
        widgets.addSeparator();
        widgets.addColor("Color",[0,1,0]);
        widgets.addPad("Pad",[0.5,0.5], function(v){ console.log(v); });
        widgets.addFile("File","test.png");
        widgets.addLine("Line",[[0.5,1],[0.75,0.25]],{defaulty:0,width:120}); 

        widgets.addSection("Tracked Entities");
        widgets.addString("string","Type");
        widgets.addCheckbox("Vehicle",true,{callback: function(value) { console.log("Vehicle pressed: " + value); } });
        widgets.addCheckbox("Pedestrain",true,{callback: function(value) { console.log("Pedestrain pressed: " + value); } });
        widgets.addCheckbox("Bicyclist",true,{callback: function(value) { console.log("Bicyclist pressed: " + value); } });
        widgets.addCheckbox("Traffic Cone",true,{callback: function(value) { console.log("Traffic pressed: " + value); } });
        widgets.addCheckbox("Barrier",true,{callback: function(value) { console.log("Barrier pressed: " + value); } });
        widgets.addCheckbox("Generic Object",true,{callback: function(value) { console.log("Generic Object pressed: " + value); } });
        widgets.addCheckbox("Construction Zone Sign",true,{callback: function(value) { console.log("Construction Zone Sign pressed: " + value); } });
        widgets.addSeparator();
        widgets.addStringButton("string button","foo", { callback_button: function(v) { console.log("Button: " + v); } });
        widgets.addTextarea(null,"Some text", {height: 100});
        var w = widgets.addCombo("combo","D",{values:["A","B","C","D","E"], callback: function(name) { console.log("Combo selected: " + name); }});
        widgets.addComboButtons("combobuttons","B",{values:["A","B","C","D"], callback: function(name) { console.log("Combo button selected: " + name); }});
        widgets.addTags("tags","pop",{values:["rap","blues","pop","jazz"], callback: function(tags) { console.log("Tag added: " + JSON.stringify(tags) ); }});

        widgets.addSection("Event Logger");
        widgets.addSection("Scene Camera Controller");
        widgets.addSection("Vehicle Operations");
        widgets.addSection("Display");
        widgets.addSection("System Status Message");
        widgets.addSection("Track Object");
        widgets.addSection("Prior-Map");
        widgets.addSection("Planning & Controls Gen 1");
        widgets.addSection("Path Tracker Point Cloud");
        widgets.addSection("Radar Point Cloud");
        widgets.addSection("ISN");
        widgets.addSection("MC Localization");
        widgets.addSection("Trajactories");

        //mainarea.resize();
    }

    createWidgetsDialog(binding: Binding)
    {
        // test floating panel
        //var name = "Dialog_" + ((Math.random() * 100)>>0);
        var name = "Mock Dialog";
        var dialog = new LiteGUI.Dialog({ id: name, title:name, close: true, minimize: true, width: 300, scroll: true, resizable:true, draggable: true, detachable: true });
        dialog.show('fade');

        //test menu in panel
        var minimenu = new LiteGUI.Menubar("minimenu");
        minimenu.add("File/new");
        minimenu.add("center", {onclick: function() { dialog.center() } });
        minimenu.attachToPanel(dialog);

        var widgets = new LiteGUI.Inspector();
        widgets.addButton("button","Update", { callback: function() { this.updateSidePanel(binding); } });
        widgets.addString("string","foo");
        widgets.addNumber("number",10, {min:0});
        widgets.addTree("tree",{ person: "javi", info: { age: 32, location: "barcelona" }, role: "worker"} );

        widgets.addSeparator();
        widgets.addVector2("vector2",[10,20], {min:0});
        widgets.addVector3("vector3",[10,20,30], {min:0});
        widgets.addSeparator();
        widgets.addTextarea("textarea","a really long silly text");
        widgets.addInfo("info","a really long silly text");
        widgets.addSlider("slider",10,{min:1,max:100,step:1});
        widgets.addCheckbox("checkbox",true);
        widgets.addCheckbox("checkbox2",false);
        widgets.addCombo("combo","javi",{values:["foo","faa","super largo texto que no cabe entero","javi","nada"]});
        widgets.addButtons("Serialize",["Save","Load","New"]);
        widgets.addButton(null,"Save");
        dialog.add(widgets);

        return dialog;
    }

    createComplexListDialog()
    {
        var dialog = new LiteGUI.Dialog( { title:"Complex List", close: true, minimize: true, width: 300, height: 400, scroll: true, resizable:true, draggable: true} );
        // dialog.show();
        // dialog.setPosition( 600,200 );

        var list = new LiteGUI.ComplexList({height: "100%"});
        dialog.add( list );

        list.addTitle("Example of title");
        for(var i = 0; i < 10; ++i)
            var elem = list.addItem({},"Example", Math.random()>0.5, true);
        list.addTitle("Example of title");
        for(var i = 0; i < 10; ++i)
            list.addItem({},"More items", Math.random()>0.5, true);
        list.addHTML("+ click me");

        return dialog;
    }

    createTableDialog()
    {
        var dialog = new LiteGUI.Dialog( { title:"Visualization Tools Team", close: true, minimize: true, width: 300, scroll: true, resizable:true, draggable: true} );
        dialog.show();
        dialog.setPosition( 200,200 );
        dialog.addButton("Randomize", inner );

        var table = new LiteGUI.Table({scrollable:true});
        dialog.add( table );

        table.setColumns(["Name",{ name: "Age", width: 50 },"Address"]);

        var data = [];

        for(var i = 0; i < 13; ++i)
            data.push({
                    name: randomName(),
                    age: 30,
                    address: "none"
                });

        inner();

        function randomName(){
            var names = ["Dana","Richard","Rohit","Paul","Bala","Parminder","Tong","Anurag","Saravanan","Renee","Sarah","Sofia","Mary"];
            var name = [];
            name.push( names[Math.floor(Math.random()*names.length)] );
            return name.join(" ");
        }

        function inner()
        {
            for(var i in data)
                data[i].age = (Math.random() * 100)|0;

            table.setRows( data, true );
        }
    }
}
