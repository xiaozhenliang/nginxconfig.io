(function() {

	angular
	.module('NginxConfigIoApp', ['ngclipboard', '720kb.tooltips'])
	.controller('NginxConfigIoController', function NginxConfigIoController($scope, $location, $timeout) {
		///////////////////////
		// PRIVATE VARIABLES //
		///////////////////////
		var data = {
			domain:				'example.com',
			path:				'/var/www/example.com',
			document_root:		'/public',
			https:				false,
			http2:				true,
			email:				'hello@example.com',
			cdn:				false,
			non_www:			true,
			php:				'7.2',
			index_php:			true,
			index_html:			false,
			wordpress:			false,

			file_structure:		'unified',

			worker_processes:	'auto',
			user:				'www-data',
			pid:				'/run/nginx.pid',
			access_log:			'/var/log/nginx/access.log',
			error_log:			'/var/log/nginx/error.log',
			gzip:				true,
			server_tokens:		false,
			log_not_found:		false,
			limit_req:			false,

			expires_assets:		'7d',
			expires_media:		'7d',
			expires_svg:		'7d',
			expires_fonts:		'7d',
		};



		/////////////////////
		// SCOPE VARIABLES //
		/////////////////////
		$scope.location = $location;
		$scope.data = angular.copy(data);
		$scope.dataInit = false;

		$scope.extensions = {
			assets:	'css(\\.map)?|js(\\.map)?',
			fonts:	'ttf|ttc|otf|eot|woff|woff2',
			svg:	'svgz?',
			images:	'jpe?g|png|gif|ico|cur|heic|webp|tiff?',
			audio:	'mp3|m4a|aac|ogg|midi?|wav',
			video:	'mp4|mov|webm|mpe?g|avi|ogv|flv|wmv',
			docs:	'pdf|docx?|xlsx?|pptx?'
		};

		$scope.gzipTypes = 'text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml';



		/////////////////////
		// SCOPE FUNCTIONS //
		/////////////////////
		$scope.refreshHighlighting = function() {
			document.querySelectorAll('main .file .code.source').forEach(function(code) {
				$timeout(function(code) {
					code.nextSibling.innerHTML = code.innerHTML;
					if (code.nextSibling.children.length && code.nextSibling.children[0].children.length) {
						hljs.highlightBlock(code.nextSibling.children[0].children[0]);
					}
				}, 0, true, code);
			});
		};

		$scope.setDataFromHash = function() {
			var hashData = $location.search();

			for (var key in hashData) {
				if ($scope.data[key] !== undefined && typeof $scope.data[key] === typeof hashData[key]) {
					$scope.data[key] = hashData[key];
					gtag('event', key, {
						event_category: 'data_from_hash',
						event_label: hashData[key],
					});
				}
			}
		};

		$scope.updateHash = function() {
			if (!$scope.dataInit) {
				return;
			}

			var changedData = {};
			for (var key in $scope.data) {
				if (!angular.equals($scope.data[key], data[key])) {
					changedData[key] = $scope.data[key];
				}
			}

			if (Object.keys(changedData).length) {
				$location.search(changedData).replace();
			} else {
				$location.search({});
			}
		};

		$scope.reset = function() {
			$scope.data = angular.copy(data);
			gtag('event', 'reset');
		};

		$scope.clipboardSuccess = function(key) {
			gtag('event', key, {
				event_category: 'clipboard',
			});
		};



		//////////////////
		// SCOPE EVENTS //
		//////////////////
		$scope.$watch('data', function(newValue, oldValue) {
			$scope.refreshHighlighting();
			$scope.updateHash();

			for (var key in $scope.data) {
				if (!angular.equals(newValue[key], oldValue[key])) {
					gtag('event', key, {
						event_category: 'data_changed',
						event_label: $scope.data[key],
					});
				}
			}

			if (!$scope.dataInit) {
				$scope.dataInit = true;
			}
		}, true);



		//////////
		// INIT //
		//////////
		$scope.setDataFromHash();
	})
	.config(['tooltipsConfProvider', function (tooltipsConfProvider) {
		tooltipsConfProvider.configure({
			side: 'right',
			size: 'small',
		});
	}])
	.directive('ngIncludeTabs', function () {
		return {
			require: 'ngInclude',
			restrict: 'A',
			link: {
				pre: function preLink(scope, iElement, iAttrs, controller) {
					var tabs = parseInt(iAttrs.ngIncludeTabs || 0);

					var startRegex = new RegExp('\t'.repeat(tabs - 1));

					controller.template = controller.template
						.replace(/^(.*)$/mg, '\t'.repeat(tabs) + '$1')
						.replace(startRegex, '')
						.replace(/\s*$/, '');
				},
			},
		};
	});

})();
