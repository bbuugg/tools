import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/Home.vue'
import HtmlExtractor from '../tools/HtmlExtractor.vue'
import JsonExtractor from '../tools/JsonExtractor.vue'
import ImageListProcessor from '../tools/ImageListProcessor.vue'
import ImageCompressor from '../tools/ImageCompressor.vue'
import ComingSoon from '../tools/ComingSoon.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      children: [
        {
          path: '',
          redirect: '/web-tools/html-extractor',
        },
        {
          path: 'web-tools/html-extractor',
          name: 'html-extractor',
          component: HtmlExtractor,
          meta: {
            category: 'web-tools',
            title: 'HTML Content Extractor',
          },
        },
        {
          path: 'data-tools/json-extractor',
          name: 'json-extractor',
          component: JsonExtractor,
          meta: {
            category: 'data-tools',
            title: 'JSON Field Extractor',
          },
        },
        {
          path: 'image-tools/image-list-processor',
          name: 'image-list-processor',
          component: ImageListProcessor,
          meta: {
            category: 'image-tools',
            title: 'Image List Processor',
          },
        },
        {
          path: 'image-tools/image-compressor',
          name: 'image-compressor',
          component: ImageCompressor,
          meta: {
            category: 'image-tools',
            title: 'Image Compressor',
          },
        },
        {
          path: 'converters/url-encoder',
          name: 'url-encoder',
          component: ComingSoon,
          meta: {
            category: 'converters',
            title: 'URL Encoder',
          },
        },
        {
          path: 'converters/base64-converter',
          name: 'base64-converter',
          component: ComingSoon,
          meta: {
            category: 'converters',
            title: 'Base64 Converter',
          },
        },
        {
          path: 'generators/color-picker',
          name: 'color-picker',
          component: ComingSoon,
          meta: {
            category: 'generators',
            title: 'Color Picker',
          },
        },
        {
          path: 'generators/qr-generator',
          name: 'qr-generator',
          component: ComingSoon,
          meta: {
            category: 'generators',
            title: 'QR Generator',
          },
        },
      ],
    },
  ],
})

export default router
