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

		// var mainarea2 = new LiteGUI.Area("mainarea",{content_id:"canvasLeftArea", autoresize: true, inmediateResize: true});
		// mainarea2.split("vertical",[200,null], true);
		// LiteGUI.add( mainarea2 );

        var canvas = document.getElementById("webgpu-canvas");
        // var ma = document.getElementById("mainarea");
        // ma.appendChild(canvas);
        canvas.width = 640;
        canvas.height = 640;
        mainarea.onresize = function() { };
        // mainarea.content.appendChild(canvas);

        var canvas2 = document.getElementById("webgpu-canvas2");
        // var ma2 = document.getElementById("mainarea");
        // ma2.appendChild(canvas2);

        canvas2.width = 640;
        canvas2.height = 640;
        // mainarea.content.appendChild(canvas2);

        //split mainarea
        this.createSidePanel(this.binding);

        mainarea.getSection(0).split("vertical",[null,"300px"],true);
        mainarea.getSection(0).getSection(0).split("horizontal",[null,"600px"],true);
        mainarea.getSection(0).getSection(0).getSection(0).add( canvas );
        mainarea.getSection(0).getSection(0).getSection(1).add( canvas2 );
        mainarea.getSection(0).onresize = function() {};

        var docked_bottom = new LiteGUI.Panel({ id: "bottom_panel", title:"Docked panel",hide:true});
        mainarea.getSection(0).getSection(1).add( docked_bottom );
        LiteGUI.bind( docked_bottom,"closed",function() { LiteGUI.mainarea.getSection(0).merge() });

        var dialog = this.createWidgetsDialog(this.binding);
        var dialog2 = this.createTableDialog();
        var dialog3 = this.createComplexListDialog();

        mainmenu.add("file/Parminder");
        mainmenu.add("file/new");
        mainmenu.add("file/open");
        mainmenu.add("file/save");
        mainmenu.add("edit/undo");
        mainmenu.add("edit/redo");
        mainmenu.add("edit/");
        mainmenu.add("edit/copy", { callback: function(){ console.log("COPY"); } });
        mainmenu.add("edit/paste");
        mainmenu.add("edit/clear");
            
        mainmenu.add("view/bottom panel", { callback: function() { docked_bottom.show(); } });
        mainmenu.add("view/fixed size", { callback: function() { LiteGUI.setWindowSize(1000, 600); } });
        mainmenu.add("view/");
        mainmenu.add("view/side panel", { callback: function() { this.createSidePanel(this.binding); } });
        mainmenu.add("view/maximize", { callback: function() { LiteGUI.setWindowSize(); } });

        mainmenu.add("debug/dialog", { callback: function() { 
            this.createDialog();
        }});

        mainmenu.add("debug/message", { callback: function() {
            binding.vextexCount = 600; 
            LiteGUI.showMessage("Setting Vertex Count 600.");
        }});

        mainmenu.add("debug/modal", { callback: function() { 
            var dialog = new LiteGUI.Panel("blarg",{width:300,height:100,close:true, content:"This is an example of modal dialog"}); 
            dialog.makeModal();
            dialog.addButton("Accept",{ close: true });
            dialog.addButton("Cancel",{ close: 'fade' });
        }});
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
        tabs_widget.addTab("Info");
        tabs_widget.addTab("Introspector",{selected:true, width: "100%", height: 200});
        tabs_widget.addTab("Extra");

        tabs_widget.getTabContent("Info").appendChild( LiteGUI.createElement( "strong",null,"Example of code inside tab container") );

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
        widgets.addSlider("Vertex count",10,{min:1,max:500000,step:1, empadding: "10", callback: function(x : number) { binding.vextexCount = Math.floor(x);; }});
        widgets.addSeparator();
        widgets.addVector2("vector2",[10,20], {min:0});
        widgets.addVector3("vector3",[10,20,30], {min:0});
        widgets.addVector4("vector4",[0.1,0.2,0.3,0.4], {min:0});
        widgets.addSection("Text stuff");
        widgets.addString("string","foo");
        widgets.addStringButton("string button","foo", { callback_button: function(v) { console.log("Button: " + v); } });
        widgets.addTextarea(null,"a really long silly text", {height: 100});
        var w = widgets.addCombo("combo","javi",{values:["foo","faa","super largo texto que no cabe entero","javi","nada"], callback: function(name) { console.log("Combo selected: " + name); }});
        widgets.addComboButtons("combobuttons","javi",{values:["foo","faa","javi","nada"], callback: function(name) { console.log("Combo button selected: " + name); }});
        widgets.addTags("tags","pop",{values:["rap","blues","pop","jazz"], callback: function(tags) { console.log("Tag added: " + JSON.stringify(tags) ); }});
        widgets.addSection("Other widgets");
        widgets.addCheckbox("checkbox",true,{callback: function(value) { console.log("Checkbox pressed: " + value); } });
        widgets.addButton("Serialize","Save",{callback: function(name) { console.log("Button pressed: " + name); } });
        widgets.addButtons("Serialize",["Save","Load","New"],{callback: function(name) { console.log("Button pressed: " + name); } });
        widgets.addButton(null,"Save");
        widgets.addSeparator();
        widgets.addColor("Color",[0,1,0]);
        widgets.addPad("Pad",[0.5,0.5], function(v){ console.log(v); });
        widgets.addFile("File","test.png");
        widgets.addLine("Line",[[0.5,1],[0.75,0.25]],{defaulty:0,width:120}); 

        //mainarea.resize();
    }

    createWidgetsDialog(binding: Binding)
    {
        //test floating panel
        var name = "Dialog_" + ((Math.random() * 100)>>0);
        var dialog = new LiteGUI.Dialog({ id: name, title:name, close: true, minimize: true, width: 300, scroll: true, resizable:true, draggable: true, detachable: true });
        dialog.show('fade');

        //test menu in panel
        var minimenu = new LiteGUI.Menubar("minimenu");
        minimenu.add("file/new");
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
        dialog.show();
        dialog.setPosition( 600,200 );

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
        var dialog = new LiteGUI.Dialog( { title:"Table dialog", close: true, minimize: true, width: 300, scroll: true, resizable:true, draggable: true} );
        dialog.show();
        dialog.setPosition( 200,200 );
        dialog.addButton("Randomize", inner );

        var table = new LiteGUI.Table({scrollable:true});
        dialog.add( table );

        table.setColumns(["Name",{ name: "Age", width: 50 },"Address"]);

        var data = [];

        for(var i = 0; i < 10; ++i)
            data.push({
                    name: randomName(),
                    age: 30,
                    address: "none"
                });

        inner();

        function randomName(){
            var names = ["Phil","Smith","Gregory","Martin","James","Coleman","Jerry","Helen","Mary"];
            var name = [];
            name.push( names[Math.floor(Math.random()*names.length)] );
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
