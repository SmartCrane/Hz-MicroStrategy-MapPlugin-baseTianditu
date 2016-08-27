(function () { 
    if (!mstrmojo.plugins.ArcGISClientKpi) {
        mstrmojo.plugins.ArcGISClientKpi = {};
    }
	dojoConfig = {
            parseOnLoad: true,
            packages: [{
                name: 'scripts',
                location: "/MicroStrategy/plugins/TDT/scripts/layerEx"
            }]
        };
    mstrmojo.requiresCls(
        "mstrmojo.CustomVisBase",
        "mstrmojo.models.template.DataInterface"
    );

    mstrmojo.plugins.ArcGISClientKpi.ArcGISClientKpi = mstrmojo.declare(
        mstrmojo.CustomVisBase,
        null,
        {
            scriptClass: "mstrmojo.plugins.ArcGISClientKpi.ArcGISClientKpi",
            cssClass: "redialprogress",
            errorMessage: "Either there is not enough data to display the visualization or the visualization configuration is incomplete.",
            errorDetails: "Erroring  Error message  0.09",
            externalLibraries: [{url:"/arcgis_js_v312_api/arcgis_js_api/library/3.12/3.12/init.js"}, 
            {url:"../plugins/js/jquery-1.12.1.min.js"}],
            useRichTooltip: true,
            reuseDOMNode: true,
            plot:function(){              

            this.domNode.innerHTML="";

            //获取数据
            var $D1 = mstrmojo.models.template.DataInterface;
            var d_interface = new $D1(this.model.data);    
            this.domNode.style.top=this.top+"px";
            this.domNode.style.left=this.left+"px";
            this.domNode.style.width=this.width+"px";
            var dataSets= d_interface.getRawData($D1.ENUM_RAW_DATA_FORMAT.ROWS);  
			debugger;
			var map; 
            $(this.domNode).append("<link rel='stylesheet' type='text/css' href='/arcgis_js_v312_api/arcgis_js_api/library/3.12/3.12/dijit/themes/claro/claro.css'>");                   
            $(this.domNode).append("<link rel='stylesheet' type='text/css' href='/arcgis_js_v312_api/arcgis_js_api/library/3.12/3.12/esri/css/esri.css'>");  
						
            $(this.domNode).append("<link rel='stylesheet' href='../plugins/js/default.css'>");
			$(this.domNode).append("<div id='map' style='width:100%;height:100%;'></div>");
            var varQueryTask,varTaskField,varTaskValue;
            require([
				"esri/map",  
				"scripts/TDTLayer",  
				"scripts/TDAnnoLayer",  
				"esri/layers/FeatureLayer",  
				"esri/layers/ImageParameters",
				"esri/layers/ArcGISDynamicMapServiceLayer",
				"esri/geometry/Point",  
				"esri/symbols/SimpleFillSymbol",  
				"esri/symbols/SimpleLineSymbol", 
				"esri/request",
				"dojo/query",
				"dojo/_base/Color",
				/**************/
                "dojo/domReady!"
                ],
               function(Map,  
				TDTLayer,  
				TDAnnoLayer,
				ImageParameters,
				ArcGISDynamicMapServiceLayer,
				 FeatureLayer,  
				 Point,  
				 SimpleFillSymbol,  
				 SimpleLineSymbol,
				esriRequest,
				query,
				 Color  ){
				/**********************
				var tokenurl,username,password,localserverip,basemapUrl,PipeLineInfo,mapServer,annolayerUrl;
				(function(){
					$.ajax({
						type:'GET',
						async:false,
						url:"/MicroStrategy/plugins/ArcGISClientHC/javascript/mojo/js/source/config.json",
						dataType:'json',
						success:function(data){
							//console.log("sucess:"+data);
							for(var key in data){
								tokenurl=data[key].tokenurl;
								username=data[key].username;
								password=data[key].password;
								localserverip=data[key].localserverip;
								basemapUrl=data[key].basemapUrl;
								annolayerUrl=data[key].annolayerUrl;
								PipeLineInfo=data[key].PipeLineInfo;
								mapServer=data[key].mapServer;
								
							}
							
						}
						
					})
				}());

			*/
			/****************/
			var photos = esriRequest({
                  url: "/MicroStrategy/plugins/Mapconfig/config.json",
                  handleAs: "json"
                });
				// console.log("photos:"+photos);
				// for(var key in photos){
					// console.log("hahah:"+photos[key]);
				// }
				var tokenurl,userid,username,password,localserverip,basemapUrl,PipeLineInfo,mapServer,annolayerUrl;
                photos.then(function(e){
					varQueryTask = e[0].QueryTask;
					console.log('json',e)
					varTaskField = e[0].TaskField;
					if(dataSets[0]['userid'])
						userid = dataSets[0]['userid'];
					else
						userid=e[0].userid;
					varMetricName = e[0].MetricName;
					varTiledMap = e[0].TiledMap;
					varConditionN = e[0].ConditionN;
					varConditionM = e[0].ConditionM;
					varDynamicServer = e[0].DynamicServer;
					console.log('1',e[0].tokenurl)
					tokenurl=e[0].tokenurl;
					username=e[0].username;
					password=e[0].password;
					localserverip=e[0].localserverip;
					basemapUrl=e[0].basemapUrl;
					PipeLineInfo=e[0].PipeLineInfo;
					mapServer=e[0].mapServer;
					annolayerUrl=e[0].annolayerUrl;
				
			/****************/
				dojo.ready (GetToken);
				function GetToken ()
				{
					
					$.ajax ({
						type : 'GET',
						async:false,
						
						url : tokenurl,
						dataType : 'html' ,//json>>error,html>>success
						contentType : 'application/json ',
						data : {
							request : 'getToken',
							username : username ,
							password : password ,
							clientid : 'ref.' +localserverip ,
							expiration : 60
						},
						timeout : 600000 ,
						success : function ( token) {
						//加载完token后再加载地图
										
							MapInit (token );
						},
						error :function (xhr ){
							return false;
						},
					});

				}
				
				function MapInit(token){
					//console.log("token"+token);															
					var fullExtent= new esri.geometry.Extent(112.3200556641,28.0234609375,117.2309443359,31.9785390625,
						new esri.SpatialReference({wkid:4326})
					);
					
					map = new Map("map",{logo:false,extent:fullExtent,zoom: 5,maxZoom: 20,});
					//console.log(map.extent);
					//var basemap = GetTDTLayer ("1","http://10.246.132.249:8080/OneMapServer/rest/services/base-tdt-image-globe/WMTS" , "img" , token ,"true" );
					
					var basemap = GetTDTLayer ("1",basemapUrl , "img" , token ,"true" );
					map.addLayer(basemap);  
					//var annolayer = GetTDTLayer ("2","http://10.246.132.249:8080/OneMapServer/rest/services/base-tdt-label-image/WMTS" , "cia" , token ,"true" ); 
					var annolayer = GetTDTLayer ("2",annolayerUrl , "cia" , token ,"true" );
					map.addLayer(annolayer);                                               
                  var ORGCODES = [];
                  // 拼接where条件 
				$.ajax({
					async:false,
					type:"GET",
					url:PipeLineInfo,
					data:"userid=" + dataSets[0]['userid'],//未来通过提示应答，单独存到报表中，再冲报表中取用户信息
					data:"userid=" + userid,
					success:function(data){
						//var arr=[];
						for(key in data){
							var orgcode=data[key].ORGCODE;
							if(dojo.indexOf(ORGCODES,orgcode)<0){
								ORGCODES.push(orgcode)
							}
						}
					
				}
					});	
				  //加载管道本体图层
				  
				  var imageParameters = new esri.layers.ImageParameters();
				  imageParameters.layerDefinitions = layerDefs;
				  imageParameters.layerIds = [53,54];
				  imageParameters.layerOption = ImageParameters.LAYER_OPTION_SHOW;
				  imageParameters.transparent = true;
				  var layerDefs = [];
				  //ORGCODE从服务中获取
				  layerDefs[0] = "ORGCODE IN ("+"'"+ORGCODES.join("','")+"'"+")";
				  varDynamicServer = mapServer;
				  GXBTLayer = new esri.layers.ArcGISDynamicMapServiceLayer(varDynamicServer,{"imageParameters": imageParameters});
				  
				  map.addLayer(GXBTLayer);  
  		  
				/**********************************/
				var attr = "";
					//加载管线基本信息
					for(var j = 0;j<dataSets.length;j++)
					{
					//var netWork = dataSets[j]["管网"];
					
					var netWork,Plancomplete,total;
					
					
					/*度量*/
					//var Plancomplete=dataSets[j]["计划完成"];
					//var total=dataSets[j]["累计完成"];
					// var total2=dataSets[j]["累计完成"];
					// var total3=dataSets[j]["累计完成"];
					

					/*******度量*************
					for(var i=0; i<d_interface.getTotalRows(); i++ ) {                                        
                      Plancomplete = d_interface.getMetricValue(i,0).getRawValue();
					  total = d_interface.getMetricValue(i,1).getRawValue();
					  // total2 = d_interface.getMetricValue(i,2).getRawValue();
					  // total3 = d_interface.getMetricValue(i,3).getRawValue();

					 
					 
					}
					***********************/
					attr = {"netWork":netWork,"Plancomplete":Plancomplete,"total":total};
				}

		
			/*******************************/	
				/*****************度量*****************
				
				for(var i=0; i<d_interface.getTotalRows(); i++ ) {                                        
                      var full_name = d_interface.getMetricValue(i,4).getRawValue();
					  console.log("fullname:"+full_name);
                  }
				  
				*****************************************/
				//console.log("5656"+dataSets.length);
					var i = setTimeout(function (){                             
						var whereVal = "";
					
					var EVENTID = [];
					
					for (var i = 0;i<dataSets.length;i++)
								{
									 var pipe_id = dataSets[i]["管网"];
									 if(dojo.indexOf(PIPEID,pipe_id)<0)
									 {
											PIPEID.push(pipe_id);
											GrandTotal.push(dataSets[i]["管输量"]);
											Percent.push(dataSets[i]["管输量完成率"]);
									 }
									 var event_id = dataSets[i]['STATIONEVENTID'];
									 if(dojo.indexOf(EVENTID,event_id)<0)
									 {
											EVENTID.push(event_id);
									 }
									
								}
					// 拼接where条件 
					var whereVal = varTaskField + "  in ( '";
					whereVal = whereVal+EVENTID.join("','")+"')";
					debugger;
					if(PIPEID.length==1){
						
						var queryTask = new esri.tasks.QueryTask(varQueryTask);
						queryTask.disableClientCaching = true;
						var query = new esri.tasks.Query();
						query.returnGeometry = true;                  
						query.spatialRel = "esriSpatialRelIntersects";
						outSR=4326;
						query.where = whereVal;     
						// console.log(whereVal);
						query.outFields =["*"];
						
						queryTask.execute(query, showResults);
					};                       
					},1000); 
				
				var PIPEID = [];
				var GrandTotal =[];
				var Percent = [];	
				var graphics = [];	
				function showResults(results){
					var Kpilayer = new esri.layers.GraphicsLayer({id: "kpi" });
					map.addLayer(Kpilayer,2);
					var resultCount = results.features.length;
					console.log("resultCount: "+resultCount);
					for(var i=0; i<resultCount; i++){
						
						//高亮颜色
						var lineSymbol = new esri.symbol.SimpleLineSymbol().setColor(new dojo.Color([247,82,196])).setWidth(3);
						// infoTemplate = new esri.InfoTemplate(attr);
						infoTemplate = new esri.InfoTemplate("信息", "123");  
						// console.log(results.features[0].geometry);
						Linegraphic = new esri.Graphic(results.features[i].geometry,lineSymbol,infoTemplate);
						// Linegraphic.setInfoTemplate(infoTemplate); 
						Kpilayer.add(Linegraphic);
						
						//添加自动弹窗坐标点                      
						// if(i==0){
							// pt = new esri.geometry.Point(results.features[i].geometry.paths[0][0][0],results.features[i].geometry.paths[0][0][1],new SpatialReference({ wkid: 4326 })); 
							// console.log(pt)
							// Kpilayer.add(new esri.Graphic(pt, new esri.symbol.TextSymbol(""), "", infoTemplate));                                                                      
						// }    
						pointIndex = Math.floor(results.features[i].geometry.paths[0].length/2);
						var PointX = results.features[i].geometry.paths[0][pointIndex][0];
						var PointY = results.features[i].geometry.paths[0][pointIndex][1];
						pt = new esri.geometry.Point(PointX,PointY,map.SpatialReference,infoTemplate);	
						Kpilayer.add(pt);
												
					}
					
					
				//设置InfoWindow
				// map.infoWindow.resize(200, 200);
				// map.infoWindow.setTitle("管网基本信息");
				// //console.log("attributes:"+Linegraphic.attributes);
				// // map.infoWindow.setContent(getTemplateContent(Linegraphic));
				// map.infoWindow.setContent("");
				// map.infoWindow.show(pt, map.getInfoWindowAnchor(pt));
				
				// console.log(results.features);
				var graphicsExtent = esri.graphicsExtent(results.features);
				graphicsExtent.spatialReference = map.spatialReference;
				// console.log("graphicsExtent: "+graphicsExtent);
				if (graphicsExtent){
						map.setExtent(graphicsExtent.expand(1.5));
				}
				
				var i = setTimeout(function (){                             
                        map.infoWindow.resize(200, 300);
                        map.infoWindow.setTitle(PIPEID[0]);   
												console.log(GrandTotal[0].v);
                        map.infoWindow.setContent("累计管输" + GrandTotal[0].v + "万吨," + "完成计划的" + Percent[0].v);                    
                        map.infoWindow.show(pt, map.getInfoWindowAnchor(pt));                                                                      
                    },1000); 
				}
				
			/**/}
			/************/
			function GetTDTLayer (id ,url , layerType , token ,visible )
				{
						var cTDTLayer ;
						require (
						[
								"scripts/TDTLayer" ,
						],

								function( TDTLayer)
								{
										cTDTLayer = new TDTLayer ();
										cTDTLayer.id = id ;
										cTDTLayer.baseURL = url ;
										cTDTLayer.layerType = layerType ;
										cTDTLayer.tokenValue = token ;
										cTDTLayer.visible = visible ;
										//map.addLayer(cTDTLayer);
										//console.log(cTDTLayer);
										//return cTDTLayer;

								}
						);
						return cTDTLayer ;
				}
			
				/*???*/});
        }); 
			/************************/															
			}/*polt*/
		})/*null xia  he  shang */
}());
