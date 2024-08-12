/* eslint-disable */
/** VERSION: 1.0.0 Please do not delete this line. Thank you! **/

// Fix the confict suggestion search in Debut theme
if (typeof theme !== 'undefined' && theme.hasOwnProperty('settings')) theme.settings.predictiveSearchEnabled = false
// Override Settings
const boostPFSFilterConfig = {
  general: {
    limit: boostPFSThemeConfig.custom.products_per_page,
    /* Optional */
    loadProductFirst: true,
    // Placeholder
    showPlaceholderProductList: true,
    placeholderProductPerRow: 3,
    placeholderProductGridItemClass: 'boost-pfs-filter-product-item boost-pfs-filter-product-item-grid boost-pfs-filter-grid-width-3 boost-pfs-filter-grid-width-mb-2',
    enableOTP: true,
    aspect_ratio: boostPFSThemeConfig.custom.aspect_ratio,
    cropImagePossitionEqualHeight: boostPFSThemeConfig.custom.product_img_crop,
    defaultDisplay: boostPFSThemeConfig.custom.product_item_type,
    selectOptionContainer: '.boost-pfs-filter-product-item-image' // CSS selector to append the product option, if left empty it will append to the product item
  },
  selector: {
    otpButtons: '.boost-pfs-filter-product-item-image'
  }
};

(function () {
  let onSale = false
  let soldOut = false
  let priceVaries = false
  let images = []
  let firstVariant = {}
  const boostPFSImgDefaultSrc = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
  const boostPFSRangeWidths = [180, 360, 540, 720, 900, 1080, 1296, 1512, 1728, 2048]

  BoostPFS.inject(this)
  boostPFSFilterConfig.general.separateRefineByFromFilter = !!((jQ('.boost-pfs-filter-tree-h').length && !Utils.isMobile() > 0 && boostPFSThemeConfig.custom.filter_tree_horizontal_style != 'style-expand'))
  Selector.stickyElementDesktop = jQ('.boost-pfs-filter-tree-v').length > 0 && !Utils.isMobile() ? '.boost-pfs-filter-left-col' : '.boost-pfs-filter-tree'

  const currentCollectionItems = document.querySelectorAll('collection-item')

  /** ************************ CUSTOMIZE DATA BEFORE BUILDING PRODUCT ITEM **************************/
  function prepareShopifyData (data) {
  // Displaying price base on the policy of Shopify, have to multiple by 100
    soldOut = !data.available // Check a product is out of stock
    onSale = data.compare_at_price_min > data.price_min // Check a product is on sale
    priceVaries = data.price_min != data.price_max // Check a product has many prices
    // Convert images to array
    images = data.images_info
    // Get First Variant (selected_or_first_available_variant)
    firstVariant = data.variants[0]
    if (Utils.getParam('variant') !== null && Utils.getParam('variant') != '') {
      const paramVariant = data.variants.filter(function (e) {
        return e.id == Utils.getParam('variant')
      })
      if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0]
    } else {
      for (let i = 0; i < data.variants.length; i++) {
        if (data.variants[i].available) {
          firstVariant = data.variants[i]
          break
        }
      }
    }
    return data
  }

  /** ************************ END CUSTOMIZE DATA BEFORE BUILDING PRODUCT ITEM **************************/
  /** ************************ BUILD PRODUCT LIST **************************/
  // Build Product Grid Item
  ProductGridItem.prototype.compileTemplate = function (data) {
    if (!data) data = this.data
    // Customize API data to get the Shopify data

    const existingCollectionItem = [...currentCollectionItems].find(item => item.dataset.handle === data.handle)
    if (existingCollectionItem) {
      return `<div class="col-6 col-md-4">
        ${existingCollectionItem.outerHTML}
      </div>`;
    }

    data = prepareShopifyData(data)

    // Get Template
    let itemHtml = boostPFSTemplate.productGridItemHtml
    // Add Custom class
    const soldOutClass = soldOut ? boostPFSTemplate.soldOutClass : ''
    const saleClass = onSale ? boostPFSTemplate.saleClass : ''

    itemHtml = itemHtml.replace(/{{soldOutClass}}/g, soldOutClass)
    itemHtml = itemHtml.replace(/{{saleClass}}/g, saleClass)
    // Add Grid Width class
    itemHtml = itemHtml.replace(/{{gridWidthClass}}/g, buildGridWidthClass(data))
    // Add Images
    // itemHtml = itemHtml.replace(/{{itemImage}}/g, buildImage(data))
    // Add Label
    itemHtml = itemHtml.replace(/{{itemLabels}}/g, buildLabels(data))
    // Add TAG Label
    itemHtml = itemHtml.replace(/{{itemTagLabels}}/g, buildTagLabels(data, false))
    // Add Price
    itemHtml = itemHtml.replace(/{{itemPrice}}/g, buildPrice(data))

    // Add Review
    if (typeof Integration === 'undefined' ||
    (typeof Integration !== 'undefined' &&
      typeof Integration.hascompileTemplate === 'function' &&
      !Integration.hascompileTemplate('reviews'))) {
      itemHtml = itemHtml.replace(/{{itemReviews}}/g, buildReview(data))
    }

    // Add Vendor
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, buildVendor(data))

    // itemActiveSwapClass
    itemHtml = itemHtml.replace(/{{itemActiveSwapClass}}/g, buildActiveSwapClass(data))

    // Add Color Swatches
    itemHtml = itemHtml.replace(/{{itemSwatches}}/g, buildProductOptionSwatches(data))

    // Add main attribute (Always put at the end of this function)
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id)
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title)
    itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle)
    itemHtml = itemHtml.replace(/{{itemVendorLabel}}/g, data.vendor)
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, Utils.buildProductItemUrlWithVariant(data))
    return itemHtml
  }
  // Build Product List Item
  ProductListItem.prototype.compileTemplate = function (data) {
    if (!data) data = this.data
    // Customize API data to get the Shopify data
    data = prepareShopifyData(data)

    // For List View
    // Get Template
    let itemHtml = boostPFSTemplate.productListItemHtml

    // Add Custom class
    const soldOutClass = soldOut ? boostPFSTemplate.soldOutClass : ''
    const saleClass = onSale ? boostPFSTemplate.saleClass : ''

    itemHtml = itemHtml.replace(/{{soldOutClass}}/g, soldOutClass)
    itemHtml = itemHtml.replace(/{{saleClass}}/g, saleClass)
    // Add Label
    itemHtml = itemHtml.replace(/{{itemLabels}}/g, buildLabels(data))
    // Add TAG Label
    itemHtml = itemHtml.replace(/{{itemTagLabels}}/g, buildTagLabels(data, false))

    // Add Review
    if (typeof Integration === 'undefined' ||
    (typeof Integration !== 'undefined' &&
      typeof Integration.hascompileTemplate === 'function' &&
      !Integration.hascompileTemplate('reviews'))) {
      itemHtml = itemHtml.replace(/{{itemReviews}}/g, buildReview(data))
    }

    // Add Vendor
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, buildVendor(data))

    // Add Price
    const itemPriceHtml = buildPrice(data, onSale, priceVaries)
    itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml)

    // Description
    var itemDescription = ''
    if (data.body_html != null) {
      var itemDescription = jQ('<p>' + data.body_html + '</p>').text()
      itemDescription = (itemDescription.split(' ')).length > 35 ? itemDescription.split(' ').splice(0, 35).join(' ') + '...' : itemDescription.split(' ').splice(0, 35).join(' ')
    }
    itemHtml = itemHtml.replace(/{{itemDescription}}/g, itemDescription)

    // itemActiveSwapClass
    itemHtml = itemHtml.replace(/{{itemActiveSwapClass}}/g, buildActiveSwapClass(data))

    // Add Color Swatches
    itemHtml = itemHtml.replace(/{{itemSwatches}}/g, buildProductOptionSwatches(data))

    // Add main attribute
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title)
    itemHtml = itemHtml.replace(/{{itemVendorLabel}}/g, data.vendor)
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, Utils.buildProductItemUrlWithVariant(data))
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id)

    return itemHtml
  // End For List View
  }

  /** ************************ END BUILD PRODUCT LIST **************************/
  /** ************************ BUILD PRODUCT ITEM ELEMENTS **************************/
  function buildGridWidthClass () {
    let gridWidthClass = ''
    // On PC
    switch (boostPFSThemeConfig.custom.products_per_row) {
      case 2:
        gridWidthClass = 'boost-pfs-filter-grid-width-2'
        break
      case 3:
        gridWidthClass = 'boost-pfs-filter-grid-width-3'
        break
      case 5:
        gridWidthClass = 'boost-pfs-filter-grid-width-5'
        break
      case 6:
        gridWidthClass = 'boost-pfs-filter-grid-width-6'
        break
      default:
        gridWidthClass = 'boost-pfs-filter-grid-width-4'
        break
    }
    // On Mobile
    switch (boostPFSThemeConfig.custom.products_per_row_m) {
      case 1:
        gridWidthClass += ' boost-pfs-filter-grid-width-mb-1'
        break
      case 3:
        gridWidthClass += ' boost-pfs-filter-grid-width-mb-3'
        break
      default:
        gridWidthClass += ' boost-pfs-filter-grid-width-mb-2'
        break
    }
    return gridWidthClass
  }

  function buildVendor (data) {
    let html = ''
    if (boostPFSThemeConfig.custom.hasOwnProperty('show_vendor') &&
    boostPFSThemeConfig.custom.show_vendor == true) {
      html = boostPFSTemplate.vendorHtml
    }
    return html
  }

  function buildImage (data) {
    let html = ''
    const featuredImage = data.variants[0].image || null
    const featuredImageSrc = featuredImage ? featuredImage.replace(/(\.jpg|\.png)/g, "_75x$1") : ''

    html = `<img src="${featuredImageSrc}" alt="${data.title}" width="600" height="750" loading="lazy" />`
    return html
  }

  function buildPrice (data) {
    let html = ''
    if (boostPFSThemeConfig.custom.hasOwnProperty('show_price') &&
    boostPFSThemeConfig.custom.show_price) {
      html += '<p class="collection-item__price">'
      html += `<span ${onSale ? 'class="sale-price"' : ''} data-collection-item-sale-price>` + Utils.formatMoney(data.price_min) + '</span>'
      html += `<s ${onSale ? '' : 'class="d-none"'} data-collection-item-compare-price>` + Utils.formatMoney(data.compare_at_price_min) + '</s> '
      html += '</p>'
    }
    return html
  }

  function buildLabels (data) {
  // Build Sold out label
    let soldOutLabel = ''
    if (boostPFSThemeConfig.custom.hasOwnProperty('sold_out_enable') &&
    boostPFSThemeConfig.custom.sold_out_enable && soldOut) {
      soldOutLabel = boostPFSTemplate.soldOutLabelHtml.replace(/{{style}}/g, '')
    }
    // Build Sale label
    let saleLabel = ''
    let salePercent = ''
    if (boostPFSThemeConfig.custom.sale_label_enable && onSale && !soldOut) {
      if (boostPFSThemeConfig.custom.sale_label_display == 'sale_percent') {
        salePercent = Math.round((data.compare_at_price_min - data.price_min) * 100 / data.compare_at_price_max)
      }
      saleLabel = boostPFSTemplate.saleLabelHtml.replace(/{{style}}/g, '')
      saleLabel = boostPFSTemplate.saleLabelHtml.replace(/percent/g, '-' + salePercent + '%')
    }
    // Build Labels
    return soldOutLabel + saleLabel
  }

  // BUILD LABEL PRODUCT WITH TAGS
  function buildTagLabels (data, showall) {
    if (boostPFSThemeConfig.custom.tag_label_enable) {
      if (showall) {
        var tagLabel = ''
        if (data.tags) {
          for (var i = 0; i < data.tags.length; i++) {
            var tag = data.tags[i]
            if (tag.indexOf('pfs:label') !== -1) {
              var preTagLabel = boostPFSTemplate.tagLabelHtml.replace(/{{labelTag}}/g, tag.split('pfs:label-')[1])
              tagLabel += preTagLabel
            }
          }
        }
      } else {
        var tagLabel = ''
        if (data.tags) {
          for (var i = data.tags.length - 1; i >= 0; i--) {
            tag = data.tags[i]
            if (tag.indexOf('pfs:label') !== -1) {
              var preTagLabel = boostPFSTemplate.tagLabelHtml.replace(/{{labelTag}}/g, tag.split('pfs:label-')[1])
              tagLabel += preTagLabel
              break
            }
          }
        }
      }
      return tagLabel
    } else {
      return ''
    }
  }
  function onlyUnique (value, index, self) {
    return self.indexOf(value) === index
  }
  // Build Color Swatches
  function buildProductOptionSwatches (data) {
    let swatchesProductOptionHtml = ''
    if (boostPFSThemeConfig.custom.swatch_enable) {
      const swatchApplyFor = ['color', 'img', 'pro_img', 'text']
      for (let i = 0; i < swatchApplyFor.length; i++) {
        const optionNames = boostPFSThemeConfig.custom['swatch_by_' + swatchApplyFor[i] + '_apply'].split(',').filter(onlyUnique)
        const swatchShape = boostPFSThemeConfig.custom['swatch_by_' + swatchApplyFor[i] + '_shape']
        const swatchType = swatchApplyFor[i]
        for (let j = 0; j < optionNames.length; j++) {
          var optionName = optionNames[j].trim()
          const filterSwatchTitle = optionName
          let swatchArr = []
          let countSwatch = 0
          let swatchValues = []
          let swatchLimit = 4

          const dataImgSize = '360'
          const bgSize = '50x'
          let dataImgSrc = Utils.getFeaturedImage(data.images_info, dataImgSize + 'x')
          let swatchName = '#ffffff'
          let bgImageSrc = ''
          const viewMoreLabel = 'More ' + filterSwatchTitle

          if (typeof data.options_with_values !== 'undefined' && data.options_with_values.length > 0) {
            swatchArr = data.options_with_values.filter(function (option) {
              return option.name == optionName
            })
            if (swatchArr.length > 0) {
              countSwatch = swatchArr[0].values.length

              if (swatchLimit > countSwatch) {
                swatchLimit = countSwatch
              }
              swatchValues = swatchArr[0].values

              swatchesProductOptionHtml += '<ul class="boost-pfs-filter-item-swatch boost-pfs-filter-item-swatch-option' + optionName + ' boost-pfs-filter-item-swatch-shape-' + swatchShape + ' boost-pfs-filter-item-swatch-type-' + swatchType + '">'

              for (let sIndex = 0; sIndex < swatchLimit; sIndex++) {
                swatchName = swatchValues[sIndex].title
                swatchVariant = data.variants[sIndex]
                sImageIndex = swatchValues[sIndex].image || ''
                if (sImageIndex != '') {
                  dataImgSrc = Utils.optimizeImage(swatchVariant.image, dataImgSize + 'x') + ' ' + dataImgSize + 'w'
                }

                if (swatchType) {
                  switch (swatchType) {
                    case 'img':
                      bgImageSrc = boostPFSAppConfig.general.file_url.replace(/\?/, Utils.slugify(filterSwatchTitle).replace(/\-/g, '_') + '-' + Utils.slugify(swatchName) + '.png?v=')
                      break
                    case 'pro_img':
                      bgImageSrc = Utils.getFeaturedImage(data.images_info, bgSize)
                      if (sImageIndex != '') {
                        bgImageSrc = Utils.optimizeImage(data.images[sImageIndex], bgSize)
                      }
                      if (bgImageSrc && bgImageSrc.includes('boost-pfs-no-image')) bgImageSrc = ''
                      break
                    default:
                      bgImageSrc = ''
                  }
                }
                swatchesProductOptionHtml += '<li>'
                if (swatchType == 'text') {
                  swatchesProductOptionHtml += '<a aria-label="' + optionName + ': ' + swatchName + '" title="' + swatchName + '" href="' + Utils.buildProductItemUrl(data) + '?variant=' + swatchVariant.id + '">' + swatchName + '</a>'
                } else {
                  if (boostPFSThemeConfig.custom.show_swatch_tooltip) {
                    swatchesProductOptionHtml += '<div class="boost-pfs-product-item-tooltip">' + swatchName + '</div>'
                  }
                  swatchesProductOptionHtml += '<span tabindex="0" aria-label="' + optionName + ': ' + swatchName + '" ' + 'style="background-color: ' + swatchName + '; '
                  if (bgImageSrc != '') {
                    swatchesProductOptionHtml += 'background-image: url(' + bgImageSrc + ');" '
                  } else {
                    swatchesProductOptionHtml += '" '
                  }
                  if (dataImgSrc != '') {
                    swatchesProductOptionHtml += 'data-img="' + dataImgSrc + '" '
                  }

                  swatchesProductOptionHtml += '></span>'
                }
                swatchesProductOptionHtml += '</li>'
              }

              if (countSwatch > swatchLimit) {
                swatchesProductOptionHtml += '<li class="boost-pfs-filter-item-swatch-more">'
                swatchesProductOptionHtml += '<a href="{{itemUrl}}" aria-label="' + viewMoreLabel + '" title="' + viewMoreLabel + '">+' + (countSwatch - swatchLimit) + '</a>'
                swatchesProductOptionHtml += '</li>'
              }

              swatchesProductOptionHtml += '</ul>'
            }
          }
        }
      }
    }
    return swatchesProductOptionHtml
  }

  // Build Color Swatches
  function eventColorSwatches (event) {
    jQ('.boost-pfs-filter-item-swatch li span').each(function () {
      const img = jQ(this).parents('.boost-pfs-filter-product-item-inner').find('.boost-pfs-filter-product-item-main-image')
      if (event == 'hover') {
        jQ(this).hover(function () {
          const newImage = jQ(this).data('img')
          img.attr('srcset', newImage)
        })
      }
      if (event == 'click') {
        jQ(this).click(function () {
          const newImage = jQ(this).data('img')
          img.attr('srcset', newImage)
        })
      }
      jQ(this).focus(function () {
        if (jQ('body').hasClass('boost-pfs-ada')) {
          const newImage = jQ(this).data('img')
          img.attr('srcset', newImage)
        }
      })
    })
  }

  function buildReview (data) {
    let html = ''
    if (boostPFSThemeConfig.custom.hasOwnProperty('show_product_review') &&
    boostPFSThemeConfig.custom.show_product_review == true) {
      html = '<span class="shopify-product-reviews-badge" data-id="{{itemId}}"></span>'
    }
    return html
  }

  function buildActiveSwapClass (data) {
    if (!Utils.isMobile() && images.length > 1 &&
    boostPFSThemeConfig.custom.hasOwnProperty('active_image_swap') &&
    boostPFSThemeConfig.custom.active_image_swap == true) {
      return 'has-bc-swap-image'
    }
    return ''
  }

  /** ************************ END BUILD PRODUCT ITEM ELEMENTS **************************/
  /** ************************ BUILD TOOLBAR **************************/
  // Build Pagination
  ProductPaginationDefault.prototype.compileTemplate = function (totalProduct) {
    if (!totalProduct) totalProduct = this.totalProduct
    // Get page info
    let currentPage = parseInt(Utils.stripHtml(Globals.queryParams.page))
    const totalPage = Math.ceil(totalProduct / Utils.stripHtml(Globals.queryParams.limit))
    if (!currentPage || isNaN(currentPage)) {
      currentPage = 1
    }
    // If it has only one page, clear Pagination
    if (totalPage <= 1) {
      return ''
    }

    let paginationHtml = boostPFSTemplate.paginateHtml
    // Build Previous
    let previousHtml = (currentPage > 1) ? boostPFSTemplate.previousActiveHtml : boostPFSTemplate.previousDisabledHtml
    previousHtml = previousHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage - 1))
    paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml)
    // Build Next
    let nextHtml = (currentPage < totalPage) ? boostPFSTemplate.nextActiveHtml : boostPFSTemplate.nextDisabledHtml
    nextHtml = nextHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage + 1))
    paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml)
    // Create page items array
    const beforeCurrentPageArr = []
    for (let iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
      beforeCurrentPageArr.unshift(iBefore)
    }
    if (currentPage - 4 > 0) {
      beforeCurrentPageArr.unshift('...')
    }
    if (currentPage - 4 >= 0) {
      beforeCurrentPageArr.unshift(1)
    }
    beforeCurrentPageArr.push(currentPage)
    const afterCurrentPageArr = []
    for (let iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
      afterCurrentPageArr.push(iAfter)
    }
    if (currentPage + 3 < totalPage) {
      afterCurrentPageArr.push('...')
    }
    if (currentPage + 3 <= totalPage) {
      afterCurrentPageArr.push(totalPage)
    }
    // Build page items
    let pageItemsHtml = ''
    const pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr)
    for (let iPage = 0; iPage < pageArr.length; iPage++) {
      if (pageArr[iPage] == '...') {
        pageItemsHtml += boostPFSTemplate.pageItemRemainHtml
      } else {
        pageItemsHtml += (pageArr[iPage] == currentPage) ? boostPFSTemplate.pageItemSelectedHtml : boostPFSTemplate.pageItemHtml
      }
      pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage])
      pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, pageArr[iPage]))
    }
    paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml)
    return paginationHtml
  }

  // Build Sorting
  ProductSorting.prototype.compileTemplate = function () {
    let html = ''
    if (boostPFSThemeConfig.custom.show_sort_by && boostPFSTemplate.hasOwnProperty('sortingHtml')) {
      const sortingArr = Utils.getSortingList()
      if (sortingArr) {
        const paramSort = Utils.stripHtml(Globals.queryParams.sort) || ''
        // Build content
        let sortingItemsHtml = ''
        for (const k in sortingArr) {
          activeClass = ''
          if (paramSort == k) {
            activeClass = 'boost-pfs-filter-sort-item-active'
          }
          sortingItemsHtml += '<li aria-label="' + sortingArr[k] + '"><a href="#" data-sort="' + k + '" class="' + activeClass + '"  title="' + sortingArr[k] + '" aria-label="' + sortingArr[k] + '">' + sortingArr[k] + '</a></li>'
        }
        html = boostPFSTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml)
      }
    }
    return html
  }

  ProductSorting.prototype.render = function () {
    jQ(Selector.topSorting).html(this.compileTemplate())

    if (jQ('.boost-pfs-filter-custom-sorting').hasClass('boost-pfs-filter-sort-active')) {
      jQ('.boost-pfs-filter-custom-sorting').toggleClass('boost-pfs-filter-sort-active')
    }

    let labelSort = ''
    const paramSort = Utils.stripHtml(Globals.queryParams.sort) || ''
    const sortingList = Utils.getSortingList()
    if (paramSort.length > 0 && sortingList && sortingList[paramSort]) {
      labelSort = sortingList[paramSort]
    } else {
      labelSort = Labels.sorting_heading
    }

    jQ('.boost-pfs-filter-custom-sorting button span span').text(labelSort)
  }

  // Build Sorting event
  ProductSorting.prototype.bindEvents = function () {
    const _this = this
    jQ('.boost-pfs-filter-filter-dropdown a').click(function (e) {
      e.preventDefault()
      FilterApi.setParam('sort', jQ(this).data('sort'))
      FilterApi.setParam('page', 1)
      FilterApi.applyFilter('sort')
    })

    jQ('.boost-pfs-filter-custom-sorting > button').click(function () {
      jQ('.boost-pfs-filter-filter-dropdown').toggle().parent().toggleClass('boost-pfs-filter-sort-active')
    })

    jQ(Selector.filterTreeMobileButton).click(function () {
      jQ('.boost-pfs-filter-top-sorting-mobile .boost-pfs-filter-filter-dropdown').hide()
    })

    jQ(document).on('click', function (e) {
      if (jQ(e.target).parents('.boost-pfs-filter-top-sorting').find('.boost-pfs-filter-filter-dropdown').length === 0) {
        jQ('.boost-pfs-filter-filter-dropdown').hide().parent().removeClass('boost-pfs-filter-sort-active')
      }
    })
  }
  // For Toolbar - Build Display type
  ProductDisplayType.prototype.compileTemplate = function () {
    let itemHtml = '<span>' + boostPFSThemeConfig.label.toolbar_viewas + '</span>'
    if (boostPFSThemeConfig.custom.product_item_type == 'grid') {
      if (boostPFSThemeConfig.custom.view_as_type == 'view_as_type_list_grid_multi_col' && !Utils.isMobile()) {
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'grid', 'list') + '" title="' + buildDisplayTitle('list') + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-list" data-view="list"><span class="icon-fallback-text"></span></a>'
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'list', 'grid') + '" title="' + buildDisplayTitle('grid', 2) + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-grid {{class.productDisplayType}}-grid-2" data-view="grid-2"><span class="icon-fallback-text"></span></a>'
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'list', 'grid') + '" title="' + buildDisplayTitle('grid', 3) + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-grid {{class.productDisplayType}}-grid-3" data-view="grid-3"><span class="icon-fallback-text"></span></a>'
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'list', 'grid') + '" title="' + buildDisplayTitle('grid', 4) + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-grid {{class.productDisplayType}}-grid-4" data-view="grid-4"><span class="icon-fallback-text"></span></a>'
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'list', 'grid') + '" title="' + buildDisplayTitle('grid', 5) + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-grid {{class.productDisplayType}}-grid-5" data-view="grid-5"><span class="icon-fallback-text"></span></a>'
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'list', 'grid') + '" title="' + buildDisplayTitle('grid', 6) + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-grid {{class.productDisplayType}}-grid-6" data-view="grid-6"><span class="icon-fallback-text"></span></a>'
      } else {
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'list', 'grid') + '" title="' + buildDisplayTitle('grid') + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-grid" data-view="grid"><span class="icon-fallback-text"></span></a>'
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'grid', 'list') + '" title="' + buildDisplayTitle('list') + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-list" data-view="list"><span class="icon-fallback-text"></span></a>'
      }
    } else {
      if (boostPFSThemeConfig.custom.view_as_type == 'view_as_type_list_grid_multi_col' && !Utils.isMobile()) {
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'grid', 'list') + '" title="' + buildDisplayTitle('list') + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-list" data-view="list"><span class="icon-fallback-text"></span></a>'
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'list', 'grid') + '" title="' + buildDisplayTitle('grid', 2) + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-grid {{class.productDisplayType}}-grid-2" data-view="grid-2"><span class="icon-fallback-text"></span></a>'
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'list', 'grid') + '" title="' + buildDisplayTitle('grid', 3) + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-grid {{class.productDisplayType}}-grid-3" data-view="grid-3"><span class="icon-fallback-text"></span></a>'
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'list', 'grid') + '" title="' + buildDisplayTitle('grid', 4) + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-grid {{class.productDisplayType}}-grid-4" data-view="grid-4"><span class="icon-fallback-text"></span></a>'
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'list', 'grid') + '" title="' + buildDisplayTitle('grid', 5) + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-grid {{class.productDisplayType}}-grid-5" data-view="grid-5"><span class="icon-fallback-text"></span></a>'
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'list', 'grid') + '" title="' + buildDisplayTitle('grid', 6) + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-grid {{class.productDisplayType}}-grid-6" data-view="grid-6"><span class="icon-fallback-text"></span></a>'
      } else {
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'grid', 'list') + '" title="' + buildDisplayTitle('list') + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-list" data-view="list"><span class="icon-fallback-text"></span></a>'
        itemHtml += '<a href="' + Utils.buildToolbarLink('display', 'list', 'grid') + '" title="' + buildDisplayTitle('grid') + '" class="{{class.productDisplayType}}-item {{class.productDisplayType}}-grid" data-view="grid"><span class="icon-fallback-text"></span></a>'
      }
    }

    itemHtml = itemHtml.replace(/{{class.productDisplayType}}/g, Class.productDisplayType)

    return itemHtml
  }

  function buildDisplayTitle (type, count) {
    if (type === '') return type
    // Build title for list view
    if (type === 'list') {
      return Labels.listView || 'List view'
    }
    // Build title for grid view
    if (typeof count === 'undefined' || count === 0) return Labels.gridView || 'Grid view'
    return (Labels.gridViewColumns || 'Grid view {{ count }} Columns').replace(/{{ count }}/g, count)
  }

  const originalRenderProductDisplayType = ProductDisplayType.prototype.render
  ProductDisplayType.prototype.render = function () {
  // Call the original function in our app lib.
  // We don't have to copy a very big function out here to modify.
  // function.call(this, param1, param2) binds the "this" pointer and params to the original function.
    originalRenderProductDisplayType.call(this)

    // Do your custom code after the original function has run
    // Active current display type
    if (this.$element.length) {
      this.$element.find(this.selector.productDisplayTypeList).removeClass('active')
      this.$element.find(this.selector.productDisplayTypeGrid).removeClass('active')
      if (Utils.stripHtml(Globals.queryParams.display) == 'list') {
        this.$element.find(this.selector.productDisplayTypeList).addClass('active')
      } else if (Utils.stripHtml(Globals.queryParams.display) == 'grid') {
        if (boostPFSThemeConfig.custom.view_as_type == 'view_as_type_list_grid_multi_col' && !Utils.isMobile()) {
          const curentGridColumn = boostPFSThemeConfig.custom.products_per_row
          this.$element.find(this.selector.productDisplayTypeGrid).each(function () {
            const $parent = jQ(this).parent()
            const $cssNames = jQ('.boost-pfs-filter-top-display-type').attr('class').split(' ')
            const $activeClass = $cssNames[$cssNames.length - 1]
            const indexCurrentColumn = $activeClass.split('-')[$activeClass.split('-').length - 1]

            if ($parent.hasClass('boost-pfs-filter-view-as-click') && jQ(this).data('view') == $activeClass) {
              jQ(this).addClass('active')

              // jQ('.boost-pfs-filter-product-item').removeClass(function(index, css) {
              // return (css.match (/(^|\s)boost-pfs-filter-grid-width-\S+/g) || []).join(' ');
              // }).addClass('boost-pfs-filter-grid-width-' + indexCurrentColumn);
              if (jQ('.boost-pfs-filter-product-item').length > 0) {
                const arrClass = jQ('.boost-pfs-filter-product-item').attr('class').split(' ')
                let prevClass = ''
                for (let i = 0; i < arrClass.length; i++) {
                  if (arrClass[i].match(/(^|\s)boost-pfs-filter-grid-width-\S+/g)) {
                    prevClass = arrClass[i]
                    break
                  }
                }
                jQ('.boost-pfs-filter-product-item').removeClass(prevClass)
                jQ('.boost-pfs-filter-product-item').addClass('boost-pfs-filter-grid-width-' + indexCurrentColumn)

              // jQ('.boost-pfs-filter-product-item').className = jQ('.boost-pfs-filter-product-item').className.replace(/(^|\s)boost-pfs-filter-grid-width-\S+/g , '');
              // jQ('.boost-pfs-filter-product-item').addClass('boost-pfs-filter-grid-width-' + indexCurrentColumn);
              }
            } else if (!$parent.hasClass('boost-pfs-filter-view-as-click') && jQ(this).data('view').split('-')[1] == curentGridColumn) {
              jQ(this).addClass('active')
            }
          })
        } else {
          this.$element.find(this.selector.productDisplayTypeGrid).addClass('active')
        }
      }
    }
  }

  // Build Show Limit
  ProductLimit.prototype.compileTemplate = function () {
    let html = ''
    if (boostPFSThemeConfig.custom.show_limit && boostPFSTemplate.hasOwnProperty('showLimitHtml')) {
      const numberList = Settings.getSettingValue('general.showLimitList')
      if (numberList != '') {
      // Build content
        let showLimitItemsHtml = ''
        const arr = numberList.split(',')
        for (const k in sortingArr) {
          showLimitItemsHtml += '<option value="' + arr[k].trim() + '">' + arr[k].trim() + '</option>'
        }
        html = boostPFSTemplate.showLimitHtml.replace(/{{showLimitItems}}/g, showLimitItemsHtml)
      }
    }
    return html
  }
  // Build Breadcrumb
  Breadcrumb.prototype.compileTemplate = function (colData) {
    if (!colData) colData = this.collectionData
    let breadcrumbItemsHtml = ''
    if (boostPFSTemplate.hasOwnProperty('breadcrumbHtml')) {
      if (typeof colData !== 'undefined' && colData.hasOwnProperty('collection')) {
        const colInfo = colData.collection
        if (typeof this.collectionTags !== 'undefined' && this.collectionTags !== null) {
          breadcrumbItemsHtml += boostPFSTemplate.breadcrumbItemLink.replace(/{{itemLink}}/g, '/collections/' + colInfo.handle).replace(/{{itemTitle}}/g, colInfo.title)
          breadcrumbItemsHtml += ' {{breadcrumbDivider}} '
          breadcrumbItemsHtml += boostPFSTemplate.breadcrumbItemSelected.replace(/{{itemTitle}}/g, this.collectionTags[0])
        } else {
          breadcrumbItemsHtml += boostPFSTemplate.breadcrumbItemSelected.replace(/{{itemTitle}}/g, colInfo.title)
        }
      } else {
        breadcrumbItemsHtml += boostPFSTemplate.breadcrumbItemSelected.replace(/{{itemTitle}}/g, Settings.getSettingValue('label.defaultCollectionHeader'))
      }
    }
    return breadcrumbItemsHtml
  }

  /** ************************ END BUILD TOOLBAR **************************/

  // Add additional feature for product list, used commonly in customizing product list
  ProductList.prototype.afterRender = function (data) {
    if (!data) data = this.data

    // Intergrate Review Shopify
    if (window.SPR &&
    typeof window.SPR.initDomEls === 'function' &&
    typeof window.SPR.loadBadges === 'function' &&
    boostPFSThemeConfig.custom.show_product_review) {
      window.SPR.initDomEls()
      window.SPR.loadBadges()
    }
  }

  // Build additional elements
  Filter.prototype.afterRender = function (data) {
    if (!data) data = this.data
    let totalProduct = data.total_product + '<span> ' + boostPFSThemeConfig.label.items_with_count_other + '</span>'
    if (data.total_product == 1) {
      totalProduct = data.total_product + '<span> ' + boostPFSThemeConfig.label.items_with_count_one + '</span>'
    }
    if (data.total_product == 0) {
      jQ('.boost-pfs-filter-default-toolbar-inner').addClass('boost-pfs-filter-toolbar-product-0')
    } else {
      jQ('.boost-pfs-filter-default-toolbar-inner').removeClass('boost-pfs-filter-toolbar-product-0')
    }
    jQ('.boost-pfs-filter-total-product').html(totalProduct)

    jQ('body').find('.boost-pfs-filter-skeleton-button').remove()

    // Prevent double tap on iOS
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    if (isiOS) {
      Utils.isMobile() && jQ('.boost-pfs-filter-product-item').find('a').on('touchstart', function () {
        isScrolling = !1
      }).on('touchmove', function () {
        isScrolling = !0
      }).on('touchend', function () {
        isScrolling || (window.location = jQ(this).attr('href'))
      })
    }

    // Build Image Swap. Put this function here to impprove the pagespeed.
    swapImage(data)

    // Build Event Color Swatch
    if (boostPFSThemeConfig.custom.swatch_change_img != 'none') {
      eventColorSwatches(boostPFSThemeConfig.custom.swatch_change_img)
    }

    if (typeof boostRemoveImageLoadingAnimation === 'function') {
      boostRemoveImageLoadingAnimation(jQ(Selector.products).find('[data-boost-image-loading-animation]'))
    }

    // Layout Fullwidth Page
    if (boostPFSThemeConfig.custom.hasOwnProperty('layout_type') && boostPFSThemeConfig.custom.layout_type == 'fullwidth' && !Utils.isMobile()) {
      jQ('body').addClass('boost-pfs-filter-fullwidth-page')
    }
    document.addEventListener('scroll', function () {
      if (jQ('.boost-pfs-filter-tree-h.boost-pfs-filter-stick').length > 0 && jQ(window).width() > 767) {
        jQ('.boost-pfs-filter-custom-sorting .boost-pfs-filter-filter-dropdown').hide().parent().removeClass('boost-pfs-filter-sort-active')
      }
    })

    // Fix confict Sticky Mobile theme Streamline
    if (jQ('.site-nav__thumb-menu').length > 0 && Utils.isMobile()) {
      const heightHeaderThemeStick = jQ('.site-nav__thumb-menu').height() + 40
      jQ('.boost-pfs-filter-tree-mobile-button-stick-wrapper').css('bottom', heightHeaderThemeStick).addClass('boost-pfs-filter-sticky-bottom')
      jQ('.boost-pfs-filter-mobile-style1').addClass('boost-pfs-filter-mobile-style1-sticky-bottom')
    }
  }

  function removeClassByPrefix (node, prefix) {
    const regx = new RegExp('\\b' + prefix + '[^ ]*[ ]?\\b', 'g')
    node.className = node.className.replace(regx, '')
    return node
  }

  const original_onClickEventProductDisplayType = ProductDisplayType.prototype._onClickEvent
  ProductDisplayType.prototype._onClickEvent = function (event) {
  // Call the original function in our app lib.
  // We don't have to copy a very big function out here to modify.
  // function.call(this, param1, param2) binds the "this" pointer and params to the original function.
    original_onClickEventProductDisplayType.call(this, event)

    // Do your custom code after the original function has run
    /*  View As Type 2/3/4/5/6 */

    if (boostPFSThemeConfig.custom.view_as_type == 'view_as_type_list_grid_multi_col' && !Utils.isMobile()) {
      jQ('.boost-pfs-filter-top-display-type').addClass('boost-pfs-filter-view-as-click')
      const currentClass = jQ(event.target).data('view')
      jQ('.boost-pfs-filter-top-display-type')[0].className = jQ('.boost-pfs-filter-top-display-type')[0].className.replace(/(^|\s)grid-\S+/g, '')
      jQ('.boost-pfs-filter-top-display-type').addClass(currentClass)
    }
  }

  ProductListPlaceholder.prototype.render = function () {
  // Set limit number for product skeleton
    const placeholderLimit = this.settings.productsPerRow || this.settings.placeholderProductPerRow
    // Build placeholder items
    const placeholderItem = this.compileTemplate()
    this.$element = []
    for (let i = 0; i < placeholderLimit; i++) {
      this.$element.push(jQ(placeholderItem))
    }
    // Show placeholder before send filter request OR hide it after get filter data
    if (!this.isFetchedProductData) {
      this.setShow()
    } else {
      this.setHide()
    }
  }

  ProductListPlaceholder.prototype.compileTemplateExtra = function () {
  // Todo: Build placeholder for List mode
    const template = boostPFSTemplate.productListPlaceholderHtml
    const imgRatioSetting = parseFloat(this.settings.placeholderImageRatio)
    const imgRatio = imgRatioSetting > 0 ? imgRatioSetting : 1.4 // It mean w1:h1.4
    /**
   * Set product class for product skeleton (to set column, style, etc.)
   * - If had defined product_grid_class in boostPFSThemeConfig => use this config ELSE use our setting
   */
    return template
      .replace(/{{class.filterProductSkeleton}}/g, Class.filterProductSkeleton)
      .replace(/{{class.filterSkeleton}}/g, Class.filterSkeleton)
      .replace(/{{class.filterSkeletonText}}/g, Class.filterSkeletonText)
      .replace(/{{paddingTop}}/g, imgRatio * 100)
  }

  /* Prevent conflict with theme vendor js */
  Array.prototype.insert = function (a, b) {}

  // Swap Image
  function swapImage (data) {
    if (!Utils.isMobile()) {
      if (boostPFSThemeConfig.custom.hasOwnProperty('active_image_swap') &&
      boostPFSThemeConfig.custom.active_image_swap == true) {
        let dataSrcSetFlipImg = ''
        let dataSrcFlipImg = ''
        let flipImageAlt = ''
        const dataSizes = 'auto'
        let dataWidths = ''
        let html = ''

        jQ('.boost-pfs-filter-product-item').each(function () {
          const productItemSelector = jQ(this)
          const imgSelector = productItemSelector.find('.boost-pfs-filter-product-item-main-image')

          if (typeof imgSelector.data('img-flip-src') !== 'undefined' &&
          imgSelector.data('img-flip-src') != '') {
            dataSrcFlipImg = imgSelector.data('img-flip-src')
            dataSrcSetFlipImg = imgSelector.data('img-flip-srcset')
            flipImageAlt = imgSelector.attr('alt')
            dataWidths = imgSelector.data('widths')
            html = '<img class="boost-pfs-filter-product-item-flip-image lazyload Image--lazyLoad"' +
            'data-srcset="' + dataSrcSetFlipImg + '" ' +
            'data-src="' + dataSrcFlipImg + '" ' +
            'data-widths="[' + dataWidths + ']" ' +
            'data-sizes="' + dataSizes + '" ' +
            'src="' + boostPFSImgDefaultSrc + '" ' +
            'alt="' + flipImageAlt + '" />'

            productItemSelector.find('.boost-pfs-filter-product-item-image-link').append(html)
          }
        })
      }
    }
  }

  // Build Placeholder for the first load
  function boostRemoveImageLoadingAnimation ($selector) {
    if ($selector.length) {
      $selector.removeAttr('data-boost-image-loading-animation')
    }
  }
  /* Expand Filter */
  jQ(document).ready(function () {
    jQ('.boost-pfs-filter-custom-filter-button').on('click', function () {
      jQ('body').toggleClass('boost-pfs-filter-custom-drawer-open')
    })
    jQ('.boost-pfs-filter-custom-drawer-close').click(function () {
      jQ('body').removeClass('boost-pfs-filter-custom-drawer-open')
    })
    jQ('.boost-pfs-filter-custom-drawer-overlay').click(function () {
      jQ('body').removeClass('boost-pfs-filter-custom-drawer-open')
    })

    // Bind changing options with enter/space key for ADA
    jQ('.boost-pfs-filter-custom-drawer-close, .boost-pfs-filter-custom-drawer-overlay').on('keydown', (event) => {
      if (event.target && (event.keyCode == 13 || event.keyCode == 32)) {
        jQ(event.target).click()
      }
    })

    // Fix issue header fix on the Parallax theme
    if (jQ('.mm-fixed-top').length > 0) {
      const headerFixedHeight = jQ('.mm-fixed-top').height()
      jQ('.boost-pfs-filter-collection-header-wrapper').css('margin-top', headerFixedHeight)
    }
  })

  FilterResult.prototype.afterRender = async function () {
    if (window.location.href.indexOf('/collections/') === -1 && window.location.href.indexOf('/search') === -1) { return }

    const isCollection = Boolean(window.location.href.indexOf('/collections/') === 1)
    const boostHeadings = document.querySelectorAll('.boost-pfs-filter-option-title-heading span')

    if (boostHeadings.length) {
      boostHeadings.forEach((boostHeading) => {
        if (boostHeading.innerHTML !== 'Refine By') { return }
        boostHeading.innerHTML = 'Active Filters'
      });
    }

    const collectionItems = document.querySelectorAll('[data-boost-collection-item]')

    await Promise.all(
      [...collectionItems].map(async (collectionItem) => {
        const handle = collectionItem.getAttribute('data-handle')
        try {
          const config = {
            credentials: 'same-origin',
            headers: {
              'X-Requested-With': 'xmlhttprequest',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: 0
            }
          }
          const collectionItemPromise = await fetch(`/products/${handle}?view=collection-item`, config)
          const html = await collectionItemPromise.text()
          const trimmedHtml = html.trim()
          if (trimmedHtml.startsWith('<collection-item')) {
            collectionItem.innerHTML = trimmedHtml
          } else {
            collectionItem.remove();
          }  
          return collectionItemPromise
        } catch (error) {
          console.log(error)
        }
      })
    )

    var yotpoApi = typeof yotpo !== 'undefined' ? new Yotpo.API(yotpo) : null;
    yotpoApi && yotpoApi.refreshWidgets();
  }
})()

window.addEventListener('load', () => {
  const boostViewMoreButtons = document.querySelectorAll('.boost-pfs-filter-option-view-more-action button')

  if (boostViewMoreButtons.length) {
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.boost-pfs-filter-option-view-more-action')) { return }

      if (event.target.innerHTML === 'View More') {
        event.target.classList.remove('active');
      } else {
        event.target.classList.add('active');
      }
    });
  }
});