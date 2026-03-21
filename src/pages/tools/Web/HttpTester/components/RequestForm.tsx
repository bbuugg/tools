import React from 'react';
import { Input, Button, Radio, Modal, Alert, Space, Typography, Switch, Row, Col, Tag, Select } from 'antd';
import { SendOutlined, InfoCircleOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import type { HttpMethod, NetworkType } from '../types';

const { Text, Paragraph } = Typography;

// 定义跨域配置弹窗组件
interface CorsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CorsModal: React.FC<CorsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'nginx' | 'php' | 'node' | 'java' | 'python' | 'go'>('nginx');
  
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DeploymentUnitOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          <FormattedMessage id="tools.httpTester.cors_settings" />
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={
        <Button onClick={onClose} type="primary">
          <FormattedMessage id="tools.httpTester.ok" />
        </Button>
      }
      width={800}
    >
      <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
        <Paragraph>
          <FormattedMessage id="tools.httpTester.cors_description" />
        </Paragraph>
        
        <Alert
          message={<FormattedMessage id="tools.httpTester.cors_warning" />}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* HTTPS到HTTP问题说明 */}
        <Alert
          message={<FormattedMessage id="tools.httpTester.https_to_http_title" />}
          description={
            <div>
              <Paragraph>
                <FormattedMessage id="tools.httpTester.https_to_http_description" />
              </Paragraph>
              <ul>
                <li>
                  <strong><FormattedMessage id="tools.httpTester.solution_one" /></strong>
                  <ul style={{ fontSize: '12px' }}>
                    <li><FormattedMessage id="tools.httpTester.solution_one_1" /></li>
                    <li><FormattedMessage id="tools.httpTester.solution_one_2" /></li>
                    <li><FormattedMessage id="tools.httpTester.solution_one_3" /></li>
                  </ul>
                </li>
                <li style={{ marginTop: '8px' }}>
                  <strong><FormattedMessage id="tools.httpTester.solution_two" /></strong>
                  <ul style={{ fontSize: '12px' }}>
                    <li><FormattedMessage id="tools.httpTester.solution_two_1" /></li>
                    <li><FormattedMessage id="tools.httpTester.solution_two_2" /></li>
                    <li><FormattedMessage id="tools.httpTester.solution_two_3" /></li>
                  </ul>
                </li>
              </ul>
              <div style={{ backgroundColor: '#2d1b2c', border: '1px solid #521c4d', padding: '8px', borderRadius: '4px', marginTop: '12px' }}>
                <Text strong style={{ color: '#ff7875' }}>
                  <FormattedMessage id="tools.httpTester.security_note" />
                </Text>
              </div>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Space orientation="vertical" style={{ width: '100%' }}>
          <Radio.Group value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
            <Space>
              <Radio.Button value="nginx">Nginx</Radio.Button>
              <Radio.Button value="php">PHP</Radio.Button>
              <Radio.Button value="node">Node.js</Radio.Button>
              <Radio.Button value="python">Python</Radio.Button>
              <Radio.Button value="java">Java</Radio.Button>
              <Radio.Button value="go">Go</Radio.Button>
            </Space>
          </Radio.Group>
          
          <div style={{ backgroundColor: '#1f1f1f', border: '1px solid #434343', borderRadius: '4px', padding: '16px', overflow: 'auto', maxHeight: '350px' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre', fontSize: '12px', color: '#d9d9d9', fontFamily: 'monospace' }}>
              <code>
                {activeTab === 'nginx' && `# 在 Nginx 的 server 或 location 块中添加：

location /api/ {
    # 允许所有来源访问（开发环境使用）
    add_header 'Access-Control-Allow-Origin' '*' always;
    
    # 允许的请求方法
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
    
    # 允许的请求头
    add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Connection, User-Agent, Cookie' always;
    
    # 允许浏览器缓存预检请求结果，单位秒
    add_header 'Access-Control-Max-Age' '3600' always;
    
    # 处理 OPTIONS 预检请求
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Connection, User-Agent, Cookie';
        add_header 'Access-Control-Max-Age' '3600';
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' '0';
        return 204;
    }
    
    # 你的其他配置...
}`}

                {activeTab === 'php' && `<?php
// 在 PHP 脚本开头添加以下代码：

// 允许所有来源访问（开发环境使用）
header("Access-Control-Allow-Origin: *");

// 如果需要发送 Cookie
// header("Access-Control-Allow-Origin: http://localhost:3000"); // 指定来源
// header("Access-Control-Allow-Credentials: true");

// 允许的请求方法
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");

// 允许的请求头
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, Connection, User-Agent, Cookie");

// 处理 OPTIONS 预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 204 No Content");
    exit;
}

// 你的 PHP 代码...
`}

                {activeTab === 'node' && `// 方法 1: 使用 Express 框架和 cors 中间件
const express = require('express');
const cors = require('cors');
const app = express();

// 基本配置: 允许所有来源
app.use(cors());

// 高级配置
app.use(cors({
  origin: '*', // 或特定域名 'http://localhost:3000'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false // 如果需要发送 Cookie，设为 true
}));

// 方法 2: 不使用中间件，手动设置响应头
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  next();
});

// 你的路由代码...
`}

                {activeTab === 'python' && `# 方法 1: 使用 Flask
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# 允许所有路由的 CORS
CORS(app)

# 或者，更具体的配置
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # 或特定域名 ["http://localhost:3000"]
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# 方法 2: 使用 FastAPI
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=False,  # 是否支持 cookies
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头
)

# 方法 3: 使用 Django
# 在 settings.py 中添加:
INSTALLED_APPS = [
    # ...其他应用
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...其他中间件
]

CORS_ALLOW_ALL_ORIGINS = True  # 允许所有来源

# 或者指定来源
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
# ]
`}

                {activeTab === 'java' && `// 方法 1: 使用 Spring Boot (添加过滤器)
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 允许所有来源访问
        config.addAllowedOrigin("*");
        // 或者允许特定来源
        // config.addAllowedOrigin("http://localhost:3000");
        
        // 允许发送 Cookie
        // config.setAllowCredentials(true);
        
        // 允许的请求方法
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");
        
        // 允许的请求头
        config.addAllowedHeader("*");
        
        // 预检请求的缓存时间
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}

// 方法 2: 使用 Spring Boot (使用 @CrossOrigin 注解)
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MyController {
    
    @GetMapping("/api/data")
    public String getData() {
        return "数据响应";
    }
}

// 方法 3: 在 Servlet 中手动设置响应头
@WebServlet("/api/*")
public class ApiServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // 设置 CORS 响应头
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        // 正常处理请求...
    }
    
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // 处理预检请求
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setStatus(HttpServletResponse.SC_NO_CONTENT);
    }
}
`}

                {activeTab === 'go' && `// 方法 1: 使用 net/http 标准库
package main

import (
	"net/http"
)

func setCorsHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*");
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}


func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		setCorsHeaders(w)

		// 处理预检请求
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	apiHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// API 处理逻辑...
	})

	// 应用中间件
	http.Handle("/api/", corsMiddleware(apiHandler))
	http.ListenAndServe(":8080", nil)
}

// 方法 2: 使用 Gin 框架
package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"time"
)

func main() {
	r := gin.Default()

	// CORS 中间件配置
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}))

	// 路由处理
	r.GET("/api/data", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "数据响应",
		})
	})

	r.Run(":8080")
}
`}
              </code>
            </pre>
          </div>
        </Space>
      </div>
    </Modal>
  );
};

interface RequestFormProps {
  url: string;
  method: HttpMethod;
  loading: boolean;
  networkType: NetworkType;
  onUrlChange: (url: string) => void;
  onMethodChange: (method: HttpMethod) => void;
  onNetworkTypeChange: (type: NetworkType) => void;
  onSendRequest: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({
  url,
  method,
  loading,
  networkType,
  onUrlChange,
  onMethodChange,
  onNetworkTypeChange,
  onSendRequest,
}) => {
  const intl = useIntl();
  
  // HTTP方法列表
  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  
  // 显示或隐藏CORS设置弹窗
  const [showCorsModal, setShowCorsModal] = React.useState(false);
  
  // 检测是否为HTTP URL
  const isHttpUrl = React.useMemo(() => {
    try {
      return url.trim().toLowerCase().startsWith('http://');
    } catch {
      return false;
    }
  }, [url]);
  
  // 检测当前页面是否为HTTPS
  const [isCurrentPageHttps, setIsCurrentPageHttps] = React.useState(false);
  
  React.useEffect(() => {
    // 仅在客户端执行
    if (typeof window !== 'undefined') {
      setIsCurrentPageHttps(window.location.protocol === 'https:');
    }
  }, []);
  
  // 显示混合内容警告的条件
  const showMixedContentWarning = networkType === 'local' && isHttpUrl && isCurrentPageHttps;
  
  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
          <Col>
          <Select defaultValue={'GET'} 
          options={methods.map((item) => ({ label: item, value: item }))} 
          onChange={onMethodChange}
          style={{ width: 120 }} />
          </Col>
          <Col flex="1">
          <Input 
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder={intl.formatMessage({ id: 'tools.httpTester.enter_url' })}
            status={showMixedContentWarning ? 'error' : undefined}
          />
        </Col>
        
        <Col>
          <Button 
            type="primary"
            icon={<SendOutlined />}
            onClick={onSendRequest}
            loading={loading}
          >
            <FormattedMessage id="tools.httpTester.send_request" />
          </Button>
        </Col>
      </Row>

      {/* 混合内容特别警告 - 当检测到HTTPS页面请求HTTP URL时 */}
      {showMixedContentWarning && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
          <Alert
            message={
              <span>
                <FormattedMessage id="tools.httpTester.https_to_http_title" />
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => setShowCorsModal(true)}
                  style={{ padding: 0, marginLeft: 8 }}
                >
                  <FormattedMessage id="tools.httpTester.cors_settings" />
                </Button>
              </span>
            }
            type="error"
            showIcon
          />
        </div>
      )}

      {/* 本地/局域网选项 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '14px' }}>
        <Space align="center">
          <Switch 
            checked={networkType === 'local'}
            onChange={(checked) => onNetworkTypeChange(checked ? 'local' : 'public')}
          />
          <label>
            <FormattedMessage id="tools.httpTester.local_network" />
          </label>
        </Space>
        
        {networkType === 'local' && (
          <Space>
            <Tag icon={<InfoCircleOutlined />} color="orange">
              <FormattedMessage id="tools.httpTester.cors_settings" />
            </Tag>
            <Button 
              size="small" 
              onClick={() => setShowCorsModal(true)}
            >
              <FormattedMessage id="tools.httpTester.cors_settings" />
            </Button>
          </Space>
        )}
      </div>

      {/* 提示信息 */}
      {networkType === 'local' && !showMixedContentWarning && (
        <div style={{ marginTop: 8 }}>
          <Button 
            type="link"
            icon={<InfoCircleOutlined />}
            onClick={() => setShowCorsModal(true)}
          >
            <FormattedMessage id="tools.httpTester.https_to_http_title" />
          </Button>
        </div>
      )}
      
      {/* CORS设置弹窗 */}
      <CorsModal 
        isOpen={showCorsModal} 
        onClose={() => setShowCorsModal(false)} 
      />
    </div>
  );
};

export default RequestForm;