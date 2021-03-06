$.getQueryString = function(name) {
    var search = location.search.substr(1);
    var reg = new RegExp('(&|^)' + name + '=([^&]*)(&|$)');
    var r = search.match(reg);
    if (r === null) return null;
    return decodeURI(r[2]);
};
$.compile = function(templateStr, dictionObj) {
    return templateStr.replace(/\{([a-zA-Z0-9_]+)\}/g, function(match, $1) {
        return dictionObj[$1];
    });
};



//fetch 获取  goods 商品 category分类 detail详情 config配置
window.shop = {
    config: {
        API_FREFIX: "http://h6.duchengjiu.top/shop/",
        PAGESIZE: 10,
        USER_TOKEN: "token",
        CART_PREFIX: "cart_"    //在本地存储商品ID和对应数量的时候使用
    },
    base: {
        storage: {
            "setItem": function(k, v) {
                return localStorage.setItem(k, v);
            },
            "getItem": function(k) {
                return localStorage.getItem(k);
            }
        },
        business: {
            "getToken": function() {
                return shop.base.storage.getItem(shop.config.USER_TOKEN)
            },
            "saveGoodsInfoOfCart": function(goods_id, number) {
                return shop.base.storage.setItem(shop.config.CART_PREFIX + goods_id, number);
            }
        }
    },
    api: {
        // 获取商品分类
        fetchGoodsCategory: function(callback) {
            $.get(shop.config.API_FREFIX + "api_cat.php", callback, "json");
        },
        // 获取商品列表
        fetchGoodsListByCatId: function(cat_id, callback) {
            $.get(shop.config.API_FREFIX + "api_goods.php", "cat_id=" + cat_id, callback, "json");
        },
        // 获取商品详情
        fetchGoodsDetail: function(goods_id, callback) {
            $.get(shop.config.API_FREFIX + "api_goods.php", "goods_id=" + goods_id, callback, "json");
        },
        // 获取热门商品
        fetchGoodsHotGoods: function(callback) {
            $.get(shop.config.API_FREFIX + "api_goods.php", callback, "json");
        },
        // 搜索商品
        searchGoods: function(opts) {
            var data = {};
            data.search_text = opts.search_text;
            data.page = opts.page || 1;
            data.pagesize = opts.pagesize || shop.config.PAGESIZE;
            var callback = opts.callback;

            $.get(shop.config.API_FREFIX + "api_goods.php", data, callback, "json");
        },
        // 验证用户名
        checkUsernameUnique: function(username, callback) {
            var data = {
                "status": "check",
                "username": username
            };
            $.post(shop.config.API_FREFIX + "api_user.php", data, callback, "json");
        },
        // 注册接口
        register: function(username, password, callback) {
            var data = {
                "status": "register",
                "username": username,
                "password": password
            };
            $.post(shop.config.API_FREFIX + "api_user.php", data, callback, "json");
        },
        // 登录接口
        login: function(username, password, callback) {
            var data = {
                "status": "login",
                "username": username,
                "password": password
            };
            $.post(shop.config.API_FREFIX + "api_user.php", data, callback, "json");
        },
        // 更新购物车
        updateCart: function(goods_id, number, callback) {
            var data = {
                "goods_id": goods_id,
                "number": number
            };
            $.post(shop.config.API_FREFIX + "api_cart.php?token=" + shop.base.business.getToken(), data, callback, "json")
        },
        // 获取购物车
        fetchCart: function(callback) {
            $.get(shop.config.API_FREFIX + "api_cart.php", "token=" + shop.base.business.getToken(), callback, "json");
        },
        // 获取用户地址
        fetchUserAddress: function(callback) {
            $.get(shop.config.API_FREFIX+"api_useraddress.php", "token="+ shop.base.business.getToken(), callback, "json");
        },
        // 添加用户地址
        addUserAddress: function(data, callback) {
            $.post(shop.config.API_FREFIX + "api_useraddress.php?token="+shop.base.business.getToken() + "&status=add", data, callback, "json");
        },
        // 删除用户地址
        deleteUserAddress: function(address, callback) {
            $.get(shop.config.API_FREFIX + "api_useraddress.php?token="+shop.base.business.getToken() + "&status=delete"+"&address_id="+address, callback, "json");
            //$.get(shop.config.API_FREFIX + "api_useraddress.php? ", data, callback, "json");
        },
        // 编辑用户地址
        editUserAddress: function() {}, //:TODO
        // 获取订单
        fetchOrder: function(callback) {
            $.get(shop.config.API_FREFIX+"api_order.php"," token="+shop.base.business.getToken(), callback, "json");
        },
        // 添加订单
        addOrder: function(address_id, total_prices, callback) {
            var data = {
                "address_id":address_id,
                "total_prices": total_prices
            };
            $.post(shop.config.API_FREFIX + "api_order.php?token=" + shop.base.business.getToken()+"&status=add", data, callback, "json");
        },
        // 取消订单
        cancelOrder: function() {}
    }
};




//var goodsUl = document.getElementById('goods-ul');
// 获取分类信息
//if(goodsUl) {	//如果页面上面有这个元素则显示出来
	shop.api.fetchGoodsCategory(function(response) {
		console.log(response);
		for (var i = 0; i < response.data.length; i++) {
			var obj = response.data[i];
			$("#nav-list").append(
				'<li class="fl"><a href="list.html?cat_id=' 
				+ obj.cat_id + '">' 
				+ obj.cat_name 
				+ '</a></li>');	
		}
	});
//}

//添加搜索功能
var searchBtn = $("#search-btn");
if (searchBtn.length === 1) {
    searchBtn.click(function() {
        location.href = 'search.html?search_text=' + $("#search-text").val();
    });
}

// 更新购物车的方法
function updateCartInfo(goods_id, goods_number, callback) {
    shop.api.updateCart(goods_id, goods_number, function(response){
        console.log(response);
        //加入购物车了之后把商品ID和对应的数量存储到本地
        shop.base.business.saveGoodsInfoOfCart(goods_id, goods_number);
        callback(response);
    });
}

//判断当前用户已登录则显示用户名，否则显示登录注册
if (localStorage.getItem("token")) {
    $(".login-reg").html("<span>考拉欢迎您！</span>"+"<a class='login-btn'>" + localStorage.getItem("username") + "</a><a class='reg-btn' href='index.html'>退出</a>");
}
$(".login-reg").children("a:last").click(function() {
    localStorage.clear();
});




