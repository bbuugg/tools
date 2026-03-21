import React, { useState, useMemo } from 'react';
import { Input, Tabs, Button, Row, Col, Typography, Empty } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { 
  // 常用图标
  faHeart, faStar, faHome, faUser, faEnvelope, faPhone, faShoppingCart, faPlay,
  faMusic, faCamera, faGift, faCheck, faBookmark, faCoffee, faGamepad, faBell,
  faSearch, faDownload, faUpload, faShare, faCog, faThumbsUp, faThumbsDown,
  faFire, faEye, faEyeSlash, faVolumeMute, faVolumeUp, faMicrophone, faMicrophoneSlash,
  
  // 商务图标
  faChartBar, faFile, faFolder, faCogs, faWrench, faRocket, faLightbulb,
  faDatabase, faCode, faBug, faEdit, faCopy, faTrash, faSave, faPrint,
  faBriefcase, faBuilding, faIndustry, faHandshake, faMoneyBill, faCreditCard,
  faChartLine, faChartPie, faCalculator, faClipboard, faFileAlt, faFilePdf,
  faFileWord, faFileExcel, faFilePowerpoint, faFileImage, faFileVideo, faFileAudio,
  
  // 科技图标
  faCloud, faServer, faLaptop, faDesktop, faMobile, faTablet,
  faShieldAlt, faLock, faKey, faGlobe, faWifi, 
  faHdd, faSdCard, faMemory, faBatteryFull, faBatteryHalf, faBatteryEmpty,
  faPlug, faPowerOff, faSignal, faRss, faQrcode,
  
  // 社交图标
  faUsers, faUserFriends, faUserPlus, faUserMinus, faComments, faComment,
  faCommentDots, faReply, faRetweet, faHashtag, faAt, faQuoteLeft, faQuoteRight,
  faPaperPlane, faInbox, faEnvelopeOpen, faEnvelopeOpenText, faAddressBook,
  faIdCard, faIdBadge, faUserTag, faUserCheck, faUserTimes,
  
  // 界面图标
  faPlus, faMinus, faTimes, faArrowRight, faArrowLeft, faArrowUp, faArrowDown,
  faSync, faRedo, faUndo, faRefresh, faExpand, faCompress, faMaximize, faMinimize,
  faAngleUp, faAngleDown, faAngleLeft, faAngleRight, faChevronUp, faChevronDown,
  faChevronLeft, faChevronRight, faCaretUp, faCaretDown, faCaretLeft, faCaretRight,
  faSort, faSortUp, faSortDown, faFilter, faBars, faEllipsisH, faEllipsisV,
  faGripHorizontal, faGripVertical, faGripLines, faGripLinesVertical,
  
  // 媒体图标
  faPause, faStop, faStepForward, faStepBackward, faFastForward, faFastBackward,
  faRandom, faRepeat, faVolumeDown, faVolumeOff, faHeadphones,
  faVideo, faVideoSlash, faImage, faImages, faPhotoVideo, faFilm,
  faCameraRetro, faRecordVinyl, faCompactDisc, faTv, faRadio, faPodcast,
  
  // 交通出行
  faCar, faTruck, faBus, faTaxi, faMotorcycle, faBicycle, faPlane, faTrain,
  faShip, faSubway, faWalking, faRunning, faMapMarkerAlt, faMap, faRoute,
  faCompass, faLocationArrow, faStreetView, faRoad, faParking, faGasPump,
  
  // 购物电商
  faShoppingBag, faShoppingBasket, faStoreAlt, faStore, faReceipt, faBarcode,
  faTags, faPercent, faGem, faCrown, faAward, faMedal, faTrophy, faRibbon,
  faGifts, faBox, faBoxOpen, faBoxes, faWarehouse, faShippingFast,
  
  // 健康医疗
  faHeart as faHeartSolid, faHeartbeat, faStethoscope, faUserMd, faHospital,
  faAmbulance, faPills, faSyringe, faThermometer, faBandAid, faFirstAid,
  faDna, faMicroscope, faXRay, faTeeth, faEye as faEyeMedical, faBrain,
  
  // 食物饮料
  faUtensils, faUtensilSpoon, faCocktail, faWineGlass,
  faBeer, faPizzaSlice, faHamburger, faHotdog, faIceCream, faCake,
  faAppleAlt, faCarrot, faCheese, faFish, faEgg, faBacon, faBreadSlice,
  
  // 运动休闲
  faFutbol, faBasketballBall, faBaseballBall, faFootballBall, faVolleyballBall,
  faTableTennis, faGolfBall, faBowlingBall, faHockeyPuck, faDumbbell,
  faSwimmer, faSkiing, faBiking, faHiking, faCampground,
  
  // 天气自然
  faSun, faMoon, faCloudSun, faCloudMoon, faCloudRain, faCloudShowersHeavy,
  faSnowflake, faBolt, faWind, faTemperatureHigh, faTemperatureLow,
  faTree, faLeaf, faSeedling, faMountain, faWater, faFire as faFireWeather,
  
  // 时间日期
  faCalendar, faCalendarAlt, faCalendarCheck, faCalendarTimes, faCalendarPlus,
  faClock, faStopwatch, faHourglass, faHourglassHalf, faHistory,
  faBusinessTime, faCalendarWeek, faCalendarDay,
  
  // 安全保护
  faShield, faShieldVirus, faUserShield, faLockOpen,
  faUnlock, faKeyboard, faFingerprint, faEyeDropper, faMask, faHardHat,
  faLifeRing, faExclamationTriangle, faInfoCircle, faQuestionCircle,
  
  // 文件格式
  faFileCode, faFileArchive, faFileContract, faFileInvoice, faFileSignature, 
  faFileDownload, faFileUpload, faFileImport, faFileExport, faFileCsv, faFileText
} from '@fortawesome/free-solid-svg-icons';
import { FormattedMessage, useIntl } from 'react-intl';

// 图标数据定义
interface IconCategory {
  key: string;
  name: string;
  icons: IconDefinition[];
}

const iconCategories: IconCategory[] = [
  {
    key: 'popular',
    name: 'popular_icons',
    icons: [
      faHeart, faStar, faHome, faUser, faEnvelope, faPhone, faShoppingCart, faPlay,
      faMusic, faCamera, faGift, faCheck, faBookmark, faCoffee, faGamepad, faBell,
      faSearch, faDownload, faUpload, faShare, faCog, faThumbsUp, faThumbsDown,
      faFire, faEye, faEyeSlash, faVolumeMute, faVolumeUp, faMicrophone, faMicrophoneSlash
    ]
  },
  {
    key: 'business',
    name: 'business_icons', 
    icons: [
      faChartBar, faFile, faFolder, faCogs, faWrench, faRocket, faLightbulb,
      faDatabase, faCode, faBug, faEdit, faCopy, faTrash, faSave, faPrint,
      faBriefcase, faBuilding, faIndustry, faHandshake, faMoneyBill, faCreditCard,
      faChartLine, faChartPie, faCalculator, faClipboard, faFileAlt, faFilePdf,
      faFileWord, faFileExcel, faFilePowerpoint, faFileImage, faFileVideo, faFileAudio
    ]
  },
  {
    key: 'tech',
    name: 'tech_icons',
    icons: [
      faCloud, faDatabase, faServer, faLaptop, faDesktop, faMobile, faTablet,
      faShieldAlt, faLock, faKey, faGlobe, faWifi, 
      faHdd, faSdCard, faMemory, faBatteryFull, faBatteryHalf, faBatteryEmpty,
      faPlug, faPowerOff, faSignal, faRss, faQrcode,
      faCode, faBug, faWrench, faDownload, faUpload
    ]
  },
  {
    key: 'social',
    name: 'social_icons',
    icons: [
      faUsers, faUserFriends, faUserPlus, faUserMinus, faComments, faComment,
      faCommentDots, faReply, faRetweet, faHashtag, faAt, faQuoteLeft, faQuoteRight,
      faPaperPlane, faInbox, faEnvelopeOpen, faEnvelopeOpenText, faAddressBook,
      faIdCard, faIdBadge, faUserTag, faUserCheck, faUserTimes,
      faUser, faEnvelope, faPhone, faHeart, faShare, faBell
    ]
  },
  {
    key: 'ui',
    name: 'ui_icons',
    icons: [
      faPlus, faMinus, faTimes, faArrowRight, faArrowLeft, faArrowUp, faArrowDown,
      faSync, faRedo, faUndo, faRefresh, faExpand, faCompress, faMaximize, faMinimize,
      faAngleUp, faAngleDown, faAngleLeft, faAngleRight, faChevronUp, faChevronDown,
      faChevronLeft, faChevronRight, faCaretUp, faCaretDown, faCaretLeft, faCaretRight,
      faSort, faSortUp, faSortDown, faFilter, faBars, faEllipsisH, faEllipsisV,
      faGripHorizontal, faGripVertical, faGripLines, faGripLinesVertical,
      faSearch, faCog, faCheck
    ]
  },
  {
    key: 'media',
    name: 'media_icons',
    icons: [
      faPlay, faPause, faStop, faStepForward, faStepBackward, faFastForward, faFastBackward,
      faRandom, faRepeat, faVolumeDown, faVolumeOff, faHeadphones,
      faVideo, faVideoSlash, faImage, faImages, faPhotoVideo, faFilm,
      faCameraRetro, faRecordVinyl, faCompactDisc, faTv, faRadio, faPodcast,
      faMusic, faCamera, faVolumeMute, faVolumeUp, faMicrophone, faMicrophoneSlash
    ]
  },
  {
    key: 'transport',
    name: 'transport_icons',
    icons: [
      faCar, faTruck, faBus, faTaxi, faMotorcycle, faBicycle, faPlane, faTrain,
      faShip, faSubway, faWalking, faRunning, faMapMarkerAlt, faMap, faRoute,
      faCompass, faLocationArrow, faStreetView, faRoad, faParking, faGasPump
    ]
  },
  {
    key: 'shopping',
    name: 'shopping_icons',
    icons: [
      faShoppingCart, faShoppingBag, faShoppingBasket, faStoreAlt, faStore, faReceipt, faBarcode,
      faTags, faPercent, faGem, faCrown, faAward, faMedal, faTrophy, faRibbon,
      faGifts, faBox, faBoxOpen, faBoxes, faWarehouse, faShippingFast,
      faMoneyBill, faCreditCard, faGift
    ]
  },
  {
    key: 'health',
    name: 'health_icons',
    icons: [
      faHeartSolid, faHeartbeat, faStethoscope, faUserMd, faHospital,
      faAmbulance, faPills, faSyringe, faThermometer, faBandAid, faFirstAid,
      faDna, faMicroscope, faXRay, faTeeth, faEyeMedical, faBrain
    ]
  },
  {
    key: 'food',
    name: 'food_icons',
    icons: [
      faUtensils, faUtensilSpoon, faCocktail, faWineGlass,
      faBeer, faPizzaSlice, faHamburger, faHotdog, faIceCream, faCake,
      faAppleAlt, faCarrot, faCheese, faFish, faEgg, faBacon, faBreadSlice, faCoffee
    ]
  },
  {
    key: 'sports',
    name: 'sports_icons',
    icons: [
      faFutbol, faBasketballBall, faBaseballBall, faFootballBall, faVolleyballBall,
      faTableTennis, faGolfBall, faBowlingBall, faHockeyPuck, faDumbbell,
      faSwimmer, faSkiing, faBiking, faHiking, faCampground
    ]
  },
  {
    key: 'weather',
    name: 'weather_icons',
    icons: [
      faSun, faMoon, faCloudSun, faCloudMoon, faCloudRain, faCloudShowersHeavy,
      faSnowflake, faBolt, faWind, faTemperatureHigh, faTemperatureLow,
      faTree, faLeaf, faSeedling, faMountain, faWater, faFireWeather, faCloud
    ]
  },
  {
    key: 'time',
    name: 'time_icons',
    icons: [
      faCalendar, faCalendarAlt, faCalendarCheck, faCalendarTimes, faCalendarPlus,
      faClock, faStopwatch, faHourglass, faHourglassHalf, faHistory,
      faBusinessTime, faCalendarWeek, faCalendarDay
    ]
  },
  {
    key: 'security',
    name: 'security_icons',
    icons: [
      faShield, faShieldVirus, faUserShield, faLockOpen,
      faUnlock, faKeyboard, faFingerprint, faEyeDropper, faMask, faHardHat,
      faLifeRing, faExclamationTriangle, faInfoCircle, faQuestionCircle,
      faShieldAlt, faLock, faKey
    ]
  },
  {
    key: 'files',
    name: 'files_icons',
    icons: [
      faFileCode, faFileArchive, faFileContract, faFileInvoice, faFileSignature,
      faFileDownload, faFileUpload, faFileImport, faFileExport, faFileCsv, faFileText, 
      faFile, faFolder, faFileAlt, faFilePdf, faFileWord, faFileExcel, 
      faFilePowerpoint, faFileImage, faFileVideo, faFileAudio
    ]
  }
];

// 为图标创建搜索关键词映射
const iconKeywords: Record<string, string[]> = {
  [faHeart.iconName]: ['heart', 'love', 'like', '心', '爱心', '喜欢'],
  [faStar.iconName]: ['star', 'favorite', 'rating', '星', '收藏', '评分'],
  [faHome.iconName]: ['home', 'house', '家', '首页'],
  [faUser.iconName]: ['user', 'person', 'profile', '用户', '人', '个人资料'],
  [faEnvelope.iconName]: ['mail', 'email', 'message', '邮件', '消息'],
  [faPhone.iconName]: ['phone', 'call', 'contact', '电话', '联系'],
  [faShoppingCart.iconName]: ['cart', 'shop', 'buy', '购物车', '商店', '购买'],
  [faPlay.iconName]: ['play', 'start', 'video', '播放', '开始', '视频'],
  [faMusic.iconName]: ['music', 'audio', 'sound', '音乐', '音频', '声音'],
  [faCamera.iconName]: ['camera', 'photo', 'picture', '相机', '照片', '图片'],
  [faGift.iconName]: ['gift', 'present', 'reward', '礼物', '奖励'],
  [faCheck.iconName]: ['check', 'ok', 'done', '检查', '确认', '完成'],
  [faBookmark.iconName]: ['bookmark', 'save', 'mark', '书签', '保存', '标记'],
  [faCoffee.iconName]: ['coffee', 'drink', 'cafe', '咖啡', '饮料'],
  [faGamepad.iconName]: ['game', 'play', 'gaming', '游戏', '娱乐'],
  [faChartBar.iconName]: ['chart', 'graph', 'analytics', '图表', '分析'],
  [faFile.iconName]: ['file', 'document', 'paper', '文件', '文档'],
  [faFolder.iconName]: ['folder', 'directory', '文件夹', '目录'],
  [faCogs.iconName]: ['settings', 'config', 'gear', '设置', '配置'],
  [faWrench.iconName]: ['tool', 'fix', 'repair', '工具', '修复'],
  [faRocket.iconName]: ['rocket', 'fast', 'launch', '火箭', '快速', '启动'],
  [faLightbulb.iconName]: ['idea', 'light', 'innovation', '想法', '创新'],
  [faDatabase.iconName]: ['database', 'data', 'storage', '数据库', '数据'],
  [faCode.iconName]: ['code', 'programming', 'developer', '代码', '编程'],
  [faBug.iconName]: ['bug', 'error', 'debug', '错误', '调试'],
  [faEdit.iconName]: ['edit', 'write', 'modify', '编辑', '修改'],
  [faCopy.iconName]: ['copy', 'duplicate', '复制'],
  [faTrash.iconName]: ['delete', 'remove', 'trash', '删除', '垃圾桶'],
  [faCloud.iconName]: ['cloud', 'online', 'storage', '云', '在线'],
  [faShieldAlt.iconName]: ['security', 'protect', 'safe', '安全', '保护'],
  [faLock.iconName]: ['lock', 'secure', 'private', '锁', '安全', '私有'],
  [faKey.iconName]: ['key', 'password', 'access', '钥匙', '密码', '访问'],
  [faGlobe.iconName]: ['world', 'global', 'internet', '世界', '全球', '网络'],
  [faWifi.iconName]: ['wifi', 'wireless', 'internet', '无线网络'],
  [faShare.iconName]: ['share', 'send', 'forward', '分享', '发送'],
  [faDownload.iconName]: ['download', 'save', '下载', '保存'],
  [faUpload.iconName]: ['upload', 'send', '上传', '发送'],
  [faBell.iconName]: ['notification', 'alert', 'bell', '通知', '提醒'],
  [faSearch.iconName]: ['search', 'find', 'look', '搜索', '查找'],
  [faCog.iconName]: ['setting', 'config', 'gear', '设置', '配置'],
  [faPlus.iconName]: ['add', 'plus', 'new', '添加', '新增'],
  [faMinus.iconName]: ['minus', 'remove', 'subtract', '减少', '删除'],
  [faTimes.iconName]: ['close', 'cancel', 'exit', '关闭', '取消'],
  [faSync.iconName]: ['refresh', 'reload', 'sync', '刷新', '同步'],
  [faSave.iconName]: ['save', 'store', 'keep', '保存', '存储'],
  [faPrint.iconName]: ['print', 'printer', '打印'],
  [faCalendar.iconName]: ['calendar', 'date', 'schedule', '日历', '日期'],
  [faClock.iconName]: ['time', 'clock', 'schedule', '时间', '时钟'],
  [faMapMarkerAlt.iconName]: ['location', 'place', 'map', '位置', '地点']
};

const { TabPane } = Tabs;
const { Text } = Typography;

interface IconSelectorProps {
  selectedIcon: IconDefinition;
  onIconSelect: (icon: IconDefinition) => void;
}

export default function IconSelector({ selectedIcon, onIconSelect }: IconSelectorProps) {
  const intl = useIntl();
  const [searchTerm, setSearchTerm] = useState('');

  // 搜索过滤图标
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return iconCategories;
    }

    const searchLower = searchTerm.toLowerCase();
    
    return iconCategories.map(category => ({
      ...category,
      icons: category.icons.filter(icon => {
        const keywords = iconKeywords[icon.iconName] || [];
        return keywords.some(keyword => 
          keyword.toLowerCase().includes(searchLower)
        ) || icon.iconName.toLowerCase().includes(searchLower);
      })
    })).filter(category => category.icons.length > 0);
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      <Input.Search
        placeholder={intl.formatMessage({ id: 'tools.iconDesigner.icon_search_placeholder' })}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        allowClear
        size="middle"
      />

      {filteredCategories.length === 0 ? (
        <Empty 
          description={<Text type="secondary"><FormattedMessage id="tools.iconDesigner.no_matching_icons" /></Text>}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div>
          {searchTerm ? (
            // 搜索模式：显示所有匹配的分类
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <div key={category.key} className="mb-6">
                  <Text strong className="block mb-3 text-sm">
                    <FormattedMessage id={`tools.iconDesigner.${category.name}`} /> ({category.icons.length})
                  </Text>
                  <Row gutter={[8, 8]}>
                    {category.icons.map((icon, index) => (
                      <Col span={3} key={`${category.key}-${index}`}>
                        <Button
                          type={selectedIcon === icon ? 'primary' : 'default'}
                          icon={<FontAwesomeIcon icon={icon} />}
                          onClick={() => onIconSelect(icon)}
                          title={icon.iconName}
                          block
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              ))}
            </div>
          ) : (
            // 分类模式：使用标签页
            <Tabs defaultActiveKey="popular" size="small" type="card">
              {iconCategories.map((category) => (
                <TabPane 
                  tab={<FormattedMessage id={`tools.iconDesigner.${category.name}`} />} 
                  key={category.key}
                >
                  <Row gutter={[8, 8]} className="mt-2">
                    {category.icons.map((icon, index) => (
                      <Col span={3} key={index}>
                        <Button
                          type={selectedIcon === icon ? 'primary' : 'default'}
                          icon={<FontAwesomeIcon icon={icon} />}
                          onClick={() => onIconSelect(icon)}
                          title={icon.iconName}
                          block
                        />
                      </Col>
                    ))}
                  </Row>
                </TabPane>
              ))}
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
} 