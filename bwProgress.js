(function(angular) {

angular.module('bw.progress',[])
.controller('bw.Controller',['$scope', function($scope){
		
	$scope.progressData = [
		{
			name: 'Acme Inc',	data: {expected: 0.75,actual: 0.78},
			children: 
			[
				{
				name: 'Finance',data: {expected: 0.70,actual: 0.62},
				children: 
				[
					{name: 'Tax',data: {expected: 0.85,actual: 0.54}},
					{name: 'Sales',data: {expected: 0.75,actual: 0.65}},
					{name: 'Purchase',data: {expected: 1.0,actual: 0.8}}
				]
				}, 
				{
				name: 'Engineering',data: {expected: 0.50,actual: 0.45},
				children: 
				[
					{name: 'Ops',data: {expected: 0.55,actual: 0.65}},
					{name: 'R&D',data: {expected: 0.45,actual: 0.25}}
				]
				},
				{
				name: 'HR',data: {expected: 0.95,actual: 0.61},
				children: 
				[
					{name: 'Payroll',data: {expected: 1.0,actual: 0.42}},
					{name: 'Benefits',data: {expected: 0.90,actual: 0.77}}
				]
				}				
			]
		}
	];
}])
.directive('collection', function () {
	return {
		restrict: "E",
		replace: true,
		scope: {
			collection: '='
		},
		template: "<ul><member ng-repeat='member in collection' member='member'></member></ul>"
	}
})
.directive( 'member', 
  function ($compile) {
    return {
      restrict: 'E',
	  replace: true,
      scope: {
        member: '='
      },
	  template: "<li style=\"border-top:1px solid black;vertical-align:top;\">{{member.name}}<bw-progress data='member.data'></bw-progress></li>",
      link: function (scope, element) {
		if (angular.isArray(scope.member.children)) {
			$compile('<collection collection="member.children"></collection>')(scope, function(cloned, scope){
			   element.append(cloned); 
			});
		}
      }
    }
  }
)
.directive( 'bwProgress', [
  function () {
    return {
      restrict: 'E',
      scope: {
        data: '='
      },
      link: function (scope, element) {

        //Render graph based on 'element'
        scope.render = function(data) {

		// The directive should take two float inputs, expected and actual, between 0.0 and 1.0.
		if (data.expected < 0 || data.expected > 1) return;
		if (data.actual < 0 || data.actual > 1) return;
		
		// The colors of the outer ring should change to orange or red when the actual is more than 25% or 50% behind expected.
		var diff = data.expected - data.actual;
		var actualFill = "limegreen";
		if (diff > 0.25 && diff <= 0.5) actualFill = "orange";
		if (diff > 0.5) actualFill = "red";
		
		var svgW = 150, svgH = 150;
		var radius = 45, innerPadding = 5, outerPadding = 2, innerThickness = 2, outerThickness = 6;
		var transitionMS = 1000;

		d3.select(element[0]).select("svg").remove();
		var svg = d3.select(element[0])
					.append("svg")
					.attr("width",svgW)
					.attr("height",svgH)
					.append("g")
					.attr("transform", "translate(" + svgW/2 + ","+ svgH/2+")")
					;
		// the thinner inner circle is drawn based on the expected.
		var expectedArc = d3.svg.arc()
					.innerRadius(radius+innerPadding)
					.outerRadius(radius+innerPadding+innerThickness)
					;
		// The thicker outer circle is drawn based on actual
		var actualArc = d3.svg.arc()
					.innerRadius(radius+innerPadding+innerThickness+outerPadding)
					.outerRadius(radius+innerPadding+innerThickness+outerPadding+outerThickness)
					;		
		// Please also animate the arcs and color transitions, add unit tests, and have reasonable handling of unexpected values.
		svg.append("path")
			.attr("fill","lime")
			.attr("class","arc")
			.transition().duration(transitionMS)
			.attrTween("d", function(){
				var start = {startAngle: 0, endAngle: 0};
				var end = {startAngle: 0, endAngle: 2 * Math.PI * data.expected};
				var interpolate = d3.interpolate(start,end);
				return function(t){
					return expectedArc(interpolate(t));
				};
			})
			;
		svg.append("path")
			.attr("class","arc")
			.attr("fill",actualFill)
			.transition().duration(transitionMS)
			.attrTween("d", function(){
				var start = {startAngle: 0, endAngle: 0};
				var end = {startAngle: 0, endAngle: 2 * Math.PI * data.actual};
				var interpolate = d3.interpolate(start,end);
				return function(t){
					return actualArc(interpolate(t));
				};
			})			
			;
		svg.append("circle")
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",radius)
			.attr("fill","LightGray")
			;
		//  The text should be the actual
		svg.append("text")
			.text(data.actual*100 + "%")
			.attr("x",-radius/2)
			.attr("y",0)
			.attr("font-family", "sans-serif")
		    .attr("font-size", "24px")
		    .attr("fill", "black")
			;
        };

         //Watch 'data' and run scope.render(newVal) whenever it changes
         //Use true for 'objectEquality' property so comparisons are done on equality and not reference
          scope.$watch('data', function(){
              scope.render(scope.data);
          }, true);  
        }
    };
  }
])
;
})(window.angular);