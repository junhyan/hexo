---
title: 网卡驱动（ixgbe为例） 
date: 2017-10-24 00:10:22
---
之前一直在做solaris操作系统的网卡驱动，从oracle放弃这个操作系统后就与网卡驱动接触的越来越少了，最近看了下linux的网卡驱动，总结一波。
### 驱动加载起源Probe

废话不多说，上代码。在代码中添加了很多的注释，但比较乱，可以直接跳过往下看。
<font color=red>注：代码块看不到的可以点击代码块按键盘左右键阅读</font>
``` c
/**
 * ixgbe_probe - Device Initialization Routine
 * @pdev: PCI device information struct //代表pci ixgbe网卡设备
 * @ent: entry in ixgbe_pci_tbl
 *
 * Returns 0 on success, negative on failure
 *
 * ixgbe_probe initializes an adapter identified by a pci_dev structure.
 * The OS initialization, configuring of the adapter private structure,
 * and a hardware reset occur.
 **/
 //pci_dev结构是在启动阶段保留下来的代表了网卡设备，体现了作为PCI设备所应有的规范。
 //net_device结构，为上层协议提供统一的接口，是驱动层的网卡操作结构,网卡的网络传输性质，实际是通过另一结构体net_device来体现的，该结构体的初始化由网卡驱动程序实现
 //PCI设备的驱动程序由pci_driver结构体表示，故网卡驱动应该是该结构体的一个实例
 //网卡驱动实际操作的特定适配器是由与硬件相关的adapter所表示的结构体，adapter体现了大部分与硬件相关的属性
 //与网卡设备pci_dev的通信是通过adapter来实现的，而这个实现则是网卡驱动所要完成的任务
 /*
  *ip
  *net_device
  *adapter adapter-hw从pci dev中读出的硬件参数
  *pci_dev
  *pci
  */
static int ixgbe_probe(struct pci_dev *pdev, const struct pci_device_id *ent)
{
    struct net_device *netdev; //point to the net_device struct, but after that is the ixgbe private data
    struct ixgbe_adapter *adapter = NULL;
    struct ixgbe_hw *hw;
    const struct ixgbe_info *ii = ixgbe_info_tbl[ent->driver_data];//通过硬件的信息来确定需要初始化那个驱动,针对不同设
备调用不同的操作
    int i, err, pci_using_dac, expected_gts;
    unsigned int indices = MAX_TX_QUEUES;//64
    u8 part_str[IXGBE_PBANUM_LENGTH];
    bool disable_dev = false;
#ifdef IXGBE_FCOE
    u16 device_caps;
#endif
    u32 eec;

    /* Catch broken hardware that put the wrong VF device ID in
     * the PCIe SR-IOV capability.
     */
    if (pdev->is_virtfn) {
        WARN(1, KERN_ERR "%s (%hx:%hx) should not be a VF!\n",
             pci_name(pdev), pdev->vendor, pdev->device);
        return -EINVAL;
    }
//PCI设备中一般都带有一些RAM和ROM 空间，通常的控制/状态寄存器和数据寄存器也往往以RAM区间的形式出现，而这些区间的地址在
设备内部一般都是从0开始编址的，那么当总线上挂接了多个设备时，对这些空间的访问就会产生冲突。所以，这些地址都要先映射到>系统总线上，再进一步映射到内核的虚拟地址空间。
    err = pci_enable_device_mem(pdev);//Initialize device before it's used by a driver. Ask low-level code to enable Memory resources
    if (err)
        return err;

    if (!dma_set_mask_and_coherent(&pdev->dev, DMA_BIT_MASK(64))) {//check the dma mask is logical 64
        pci_using_dac = 1; ：//DAC是一种将数字信号转换为模拟信号（以电流、电压或电荷的形式）的设备,is this mean support in 64 bit sys???
    } else {
        err = dma_set_mask_and_coherent(&pdev->dev, DMA_BIT_MASK(32));
        if (err) {
            dev_err(&pdev->dev,
                "No usable DMA configuration, aborting\n");
            goto err_dma;
        }
        pci_using_dac = 0;
    }
    //几乎每一种外设都是通过读写设备上的寄存器来进行的，通常包括控制寄存器、状态寄存器和数据寄存器三大类，外设的寄存器
通常被连续地编址
    err = pci_request_mem_regions(pdev, ixgbe_driver_name);//alloc phy mem to dev通知内核该设备对应的IO端口和内存资源>已经使用，其他的PCI设备不要再使用这个区域
    if (err) {
        dev_err(&pdev->dev,
            "pci_request_selected_regions failed 0x%x\n", e//register the netdev to the system, via rtnetlinkrr);
        goto err_pci_reg;
    }

    pci_enable_pcie_error_reporting(pdev);

    pci_set_master(pdev);//enables bus-mastering for device dev
    pci_save_state(pdev);//save the PCI configuration space of a device before suspending而PCI配置空间由Linux内核中的PCI初始化代码使用，这些代码用于配置PCI设备，比如中断号以及I/O或内存基地址

    if (ii->mac == ixgbe_mac_82598EB) {
#ifdef CONFIG_IXGBE_DCB
        /* 8 TC w/ 4 queues per TC */
        indices = 4 * MAX_TRAFFIC_CLASS;
#else
        indices = IXGBE_MAX_RSS_INDICES;
#endif
    }
//Allocates a struct net_device with private data area for driver use and performs basic initialization.  Also allocates subqueue structs for each queue on the device.

    netdev = alloc_etherdev_mq(sizeof(struct ixgbe_adapter), indices);// indices max tx queue 64 defined local, alloc_netdev_mqs, the alloc size is net_device plus ixgbe_adapter
    if (!netdev) {
        err = -ENOMEM;
        goto err_alloc_etherdev;
    }

    SET_NETDEV_DEV(netdev, &pdev->dev);//(netdev)->dev.parent = (pdev) the device to which it is attached

    adapter = netdev_priv(netdev); //point to the end of net_device struct, access network device private data

    adapter->netdev = netdev;
    adapter->pdev = pdev; //pci dev
    hw = &adapter->hw;//hw assign
    hw->back = adapter;
    adapter->msg_enable = netif_msg_init(debug, DEFAULT_MSG_ENABLE);

    hw->hw_addr = ioremap(pci_resource_start(pdev, 0),
                  pci_resource_len(pdev, 0));//map dev physical address to the virtrul mem addr to make the driver can be operated.
    adapter->io_addr = hw->hw_addr;
    if (!hw->hw_addr) {
        err = -EIO;
        goto err_ioremap;
    }

    netdev->netdev_ops = &ixgbe_netdev_ops;//ixgbe operatation .open .close .start_xmit
    ixgbe_set_ethtool_ops(netdev); //netdev->ethtool_ops callback &ixgbe_ethtool_ops;
    netdev->watchdog_timeo = 5 * HZ;
    strlcpy(netdev->name, pci_name(pdev), sizeof(netdev->name));

    /* Setup hw api */
    hw->mac.ops   = *ii->mac_ops;
    hw->mac.type  = ii->mac;
    hw->mvals     = ii->mvals;
    if (ii->link_ops)
        hw->link.ops  = *ii->link_ops;

    /* EEPROM */
    hw->eeprom.ops = *ii->eeprom_ops;
    eec = IXGBE_READ_REG(hw, IXGBE_EEC(hw)); //EEC EEPROM/Flash Control Register
    if (ixgbe_removed(hw->hw_addr)) { //maped by ioremap
        err = -EIO;
        goto err_ioremap;
    }
    /* If EEPROM is valid (bit 8 = 1), use default otherwise use bit bang */
    if (!(eec & BIT(8)))
        hw->eeprom.ops.read = &ixgbe_read_eeprom_bit_bang_generic;

    /* setup the private structure */
    err = ixgbe_sw_init(adapter, ii);// Initialize general software structures (struct ixgbe_adapter)based on PCI device information
    if (err)
        goto err_sw_init;

    /* Make sure the SWFW semaphore is in a valid state */
    if (hw->mac.ops.init_swfw_sync)
        hw->mac.ops.init_swfw_sync(hw);

    /* Make it possible the adapter to be woken up via WOL */ //wake on lan

/*  Resets the hardware by resetting the transmit and receive units, masks
 *  and clears all interrupts, perform a PHY reset, and perform a link (MAC)
 *  reset.
 **/
    err = hw->mac.ops.reset_hw(hw);//ixgbe_reset_hw_82599, init hw include tx rx units and mac, link
    hw->phy.reset_if_overtemp = false;
    ixgbe_set_eee_capable(adapter);
    if (err == IXGBE_ERR_SFP_NOT_PRESENT) {//sfp Small Form-factor Pluggable 电信号转换为光信号的接口器件
        err = 0;
    } else if (err == IXGBE_ERR_SFP_NOT_SUPPORTED) {
        e_dev_err("failed to load because an unsupported SFP+ or QSFP module type was detected.\n");
        e_dev_err("Reload the driver after installing a supported module.\n");
        goto err_sw_init;
    } else if (err) {
        e_dev_err("HW Init failed: %d\n", err);
        goto err_sw_init;
    }

#ifdef CONFIG_PCI_IOV
    /* SR-IOV not supported on the 82598 */
    if (adapter->hw.mac.type == ixgbe_mac_82598EB)
        goto skip_sriov;
    /* Mailbox */
    ixgbe_init_mbx_params_pf(hw); //Initializes the hw->mbx struct to correct values for pf mailbox
    hw->mbx.ops = ii->mbx_ops;//mbx operation based on the mac type
    pci_sriov_set_totalvfs(pdev, IXGBE_MAX_VFS_DRV_LIMIT);//dev->sriov->driver_max_VFs = numvfs;63
    ixgbe_enable_sriov(adapter, max_vfs);//max_vfs??? 0
skip_sriov:

#endif
    /* make sure the EEPROM is good */ //Electrically Erasable Programmable read only memory
    if (hw->eeprom.ops.validate_checksum(hw, NULL) < 0) {
        e_dev_err("The EEPROM Checksum Is Not Valid\n");
        err = -EIO;
        goto err_sw_init;
    }

    eth_platform_get_mac_address(&adapter->pdev->dev,
                     adapter->hw.mac.perm_addr);//copy pdev info macaddr to the adapter hw initial value of the ports MAC address.

    memcpy(netdev->dev_addr, hw->mac.perm_addr, netdev->addr_len);//copy the hw mac addr to the net_device dev_addr

    if (!is_valid_ether_addr(netdev->dev_addr)) { // validate the dev addr
        e_dev_err("invalid MAC address\n");
        err = -EIO;
        goto err_sw_init;
    }

    /* Set hw->mac.addr to permanent MAC address */
    ether_addr_copy(hw->mac.addr, hw->mac.perm_addr);//copy the init mac addr to the current mac addr
    ixgbe_mac_set_default_filter(adapter);//write hw mac addr to the rar as the default mac filter

    timer_setup(&adapter->service_timer, ixgbe_service_timer, 0);//setup timer, service_timer->function =ixgbe_service_timer

    if (ixgbe_removed(hw->hw_addr)) {
        err = -EIO;
        goto err_sw_init;
    }
    INIT_WORK(&adapter->service_task, ixgbe_service_task);//init work service_task->fun=ixgbe_service_task ???work
    set_bit(__IXGBE_SERVICE_INITED, &adapter->state);
    clear_bit(__IXGBE_SERVICE_SCHED, &adapter->state);

    err = ixgbe_init_interrupt_scheme(adapter);//interrupt vectors init

    if (err)
        goto err_sw_init;

    for (i = 0; i < adapter->num_rx_queues; i++) //init ring->syncp
        u64_stats_init(&adapter->rx_ring[i]->syncp);
    for (i = 0; i < adapter->num_tx_queues; i++)
        u64_stats_init(&adapter->tx_ring[i]->syncp);
    for (i = 0; i < adapter->num_xdp_queues; i++)
        u64_stats_init(&adapter->xdp_ring[i]->syncp);
    /* WOL not supported for all devices */
    adapter->wol = 0;
    hw->eeprom.ops.read(hw, 0x2c, &adapter->eeprom_cap);
    hw->wol_enabled = ixgbe_wol_supported(adapter, pdev->device, //wake on lan
                        pdev->subsystem_device);
    if (hw->wol_enabled)
        adapter->wol = IXGBE_WUFC_MAG;

    device_set_wakeup_enable(&adapter->pdev->dev, adapter->wol);

    /* save off EEPROM version number */
    hw->eeprom.ops.read(hw, 0x2e, &adapter->eeprom_verh);
    hw->eeprom.ops.read(hw, 0x2d, &adapter->eeprom_verl);

    /* pick up the PCI bus settings for reporting later */
    if (ixgbe_pcie_from_parent(hw))
        ixgbe_get_parent_bus_info(adapter); //get information from pci bus
    else
         hw->mac.ops.get_bus_info(hw);

    /* calculate the expected PCIe bandwidth required for optimal
     * performance. Note that some older parts will never have enough
     * bandwidth due to being older generation PCIe parts. We clamp these
     * parts to ensure no warning is displayed if it can't be fixed.
     */
    switch (hw->mac.type) {
    case ixgbe_mac_82598EB:
        expected_gts = min(ixgbe_enumerate_functions(adapter) * 10, 16);
        break;
    default:
        expected_gts = ixgbe_enumerate_functions(adapter) * 10; //ixgbe_enumerate_functions get the port numbers of the dev
        break;
    }

    /* don't check link if we failed to enumerate functions */
    if (expected_gts > 0)
        ixgbe_check_minimum_link(adapter, expected_gts);

    err = ixgbe_read_pba_string_generic(hw, part_str, sizeof(part_str));
    if (err)
        strlcpy(part_str, "Unknown", sizeof(part_str));
    if (ixgbe_is_sfp(hw) && hw->phy.sfp_type != ixgbe_sfp_type_not_present)                                           
        e_dev_info("MAC: %d, PHY: %d, SFP+: %d, PBA No: %s\n",
               hw->mac.type, hw->phy.type, hw->phy.sfp_type,
               part_str);
    else
        e_dev_info("MAC: %d, PHY: %d, PBA No: %s\n",
               hw->mac.type, hw->phy.type, part_str);

    e_dev_info("%pM\n", netdev->dev_addr);

    /* reset the hardware with the new settings */
    err = hw->mac.ops.start_hw(hw);
    if (err == IXGBE_ERR_EEPROM_VERSION) {
        /* We are running on a pre-production device, log a warning */
        e_dev_warn("This device is a pre-production adapter/LOM. "
               "Please be aware there may be issues associated "
               "with your hardware.  If you are experiencing "
               "problems please contact your Intel or hardware "
               "representative who provided you with this "
               "hardware.\n");
    }
    strcpy(netdev->name, "eth%d");
    pci_set_drvdata(pdev, adapter);//set pdev->driver=adapter
    err = register_netdev(netdev);//register the netdev to the system, via rtnetlink
    if (err)
        goto err_register;


    /* power down the optics for 82599 SFP+ fiber */
    if (hw->mac.ops.disable_tx_laser)
        hw->mac.ops.disable_tx_laser(hw);

    /* carrier off reporting is important to ethtool even BEFORE open */
    netif_carrier_off(netdev);// 当设备驱动侦测到在其设备上丢失信号时，它调用netif_carrier_off函数

#ifdef CONFIG_IXGBE_DCA
    if (dca_add_requester(&pdev->dev) == 0) {
        adapter->flags |= IXGBE_FLAG_DCA_ENABLED;
        ixgbe_setup_dca(adapter); //direct cache access
    }
#endif
    if (adapter->flags & IXGBE_FLAG_SRIOV_ENABLED) { //IXGBE_FLAG_SRIOV_ENABLED is set at ixgbe_enble_sriov
        e_info(probe, "IOV is enabled with %d VFs\n", adapter->num_vfs);
        for (i = 0; i < adapter->num_vfs; i++) //config vf mac address
            ixgbe_vf_configuration(pdev, (i | 0x10000000));
    /* firmware requires driver version to be 0xFFFFFFFF
     * since os does not support feature
     */
    if (hw->mac.ops.set_fw_drv_ver)
        hw->mac.ops.set_fw_drv_ver(hw, 0xFF, 0xFF, 0xFF, 0xFF,
                       sizeof(ixgbe_driver_version) - 1,
                       ixgbe_driver_version);

    /* add san mac addr to netdev */
    ixgbe_add_sanmac_netdev(netdev); //add Storage Area Networks mac addr

    e_dev_info("%s\n", ixgbe_default_device_descr);
}
```
加了很多注释在这个函数中，这已经是精简过很多的代码,但还是太杂乱。针对一些关键的部分进行详细的跟踪。
主要包括netdev分配函数alloc_etherdev_mq，adapter获取函数netdev_priv，ixgbe软件结构体ixgbe_adapter的初始化函数ixgbe_sw_init，mac地址的获取和添加和mac filter可以看上面代码中的注释，还有就是网卡的中断注册函数ixgbe_init_interrupt_scheme。这些都会在后续部分进行介绍。

### netdev分配

pcidev，netdev，adapter的关系我个人的观点就试pcidev可以理解为就是pci插槽上的物理网卡，netdev是上层协议所识别的网络设备，adapter就是驱动，把pcidev转变成大家认识的netdev并且把数据处理后传递给上层或发送出去。
alloc_netdev_mqs会分配一个sizeof（netdev）+sizeof（ixgbe_adapter）大小的空间，并且在空间里做一些初始化的操作。
``` c
struct net_device *alloc_netdev_mqs(int sizeof_priv, const char *name,
        unsigned char name_assign_type,
        void (*setup)(struct net_device *),
        unsigned int txqs, unsigned int rxqs)
{
    alloc_size = sizeof(struct net_device);//alloc netdev size
    if（...）
        alloc_size += sizeof_priv;//add net_device and ixgbe_adapter  private data
    p = kvzalloc(alloc_size, GFP_KERNEL | __GFP_RETRY_MAYFAIL); // struct net_device+struct adapter
    dev_mc_init(dev);//Init multicast address list the list is only it's self
    dev_uc_init(dev);//Init unicast address list
    setup(dev);//callback ether_setup init netdev,dev->header_ops = &eth_header_ops;
    if (netif_alloc_netdev_queues(dev))//alloc tx queues
    if (netif_alloc_rx_queues(dev))//alloc rx queues
    dev->group = INIT_NETDEV_GROUP; //Initial net device group. All devices belong to group 0 by default
}
```
### adapter的获取
adapter的获取可以说是一个小技巧，但是在linux中却特别常用。具体代码如下：

``` c
static inline void *netdev_priv(const struct net_device *dev)                                                         
{   
    //point to the end of net_device struct, access network device private data
    return (char *)dev + ALIGN(sizeof(struct net_device), NETDEV_ALIGN);
}  
```
注释我加上去的英语水平也有限，大家凑和理解。因为在分配netdev的时候已经分配了adapter大小的空间，所以这个时候只要把指针指到该位置即可。

### adapter初始化
驱动的初始化主要在ixgbe_sw_init函数中，该函数根据pci信息对ixgbe驱动进行初始化操作。因为代码也较长，所以对代码做一些精简，但是一定要有个概念，驱动中的每一行代码都有其重要的作用，具体代码及其我加的注释如下：

``` c
static int ixgbe_sw_init(struct ixgbe_adapter *adapter,
             const struct ixgbe_info *ii)
{
    rss = min_t(int, ixgbe_max_rss_indices(adapter), num_online_cpus());//get the min one from nic rss and online cpu core for 82599 IXGBE_MAX_RSS_INDICES is 16 
    adapter->ring_feature[RING_F_RSS].limit = rss; //ring_feature rss, this value will be used to alloc q_vector if the feather used is rss
       adapter->mac_table = kzalloc(sizeof(struct ixgbe_mac_addr) * //alloc mac table
                     hw->mac.num_rar_entries,//Receive Address register num_rar_entries when assign the value
                     GFP_ATOMIC);

```
在代码中有一些我加的注释，在该函数中还会根据不同硬件类型赋予驱动不同的功能feather，由于太多就不加进来了，有兴趣的可以去研究下linux源码。

### 中断注册

在这里介绍较新的msi-x的中断注册。注册函数在probe函数中是ixgbe_init_interrupt_scheme，其具体内容如下：
``` c
int ixgbe_init_interrupt_scheme(struct ixgbe_adapter *adapter)
{
    /* Number of supported queues */
    ixgbe_set_num_queues(adapter); //set rx and tx queue num                                                          

    /* Set interrupt mode */
    ixgbe_set_interrupt_capability(adapter); //if enable msi, get the num of msix vector.and set flag IXGBE_FLAG_MSIX_ENABLED,  else disable some feathers and set vector to 1,

    err = ixgbe_alloc_q_vectors(adapter); //according to the vector's num alloc interrupt vector to rx and tx ring.
}
```
正如在代码中注释写的一样，ixgbe_set_num_queues会获得网卡的tx和rx队列的数量。ixgbe_set_interrupt_capability函数会在最开始调用ixgbe_acquire_msix_vectors函数来判断是否支持MSI-X，本文只对MSI-X方式的网卡中断做介绍。
ixgbe_acquire_msix_vectors所作的事情就是尽可能的找到满足队列要求的最大的中断向量数，当然也会取决于online cpu的限制，把adapter的中断向量数目设置为合适的向量数与最大向量数中较小的一个，并且为adapter添加MSI-X的feacher。具体的内容大家可以阅读该函数的源码。
ixgbe_alloc_q_vectors算一个重头戏，实现把中断向量与收发队列进行配对。列出部分主要代码来进行分析。
```c
static int ixgbe_alloc_q_vectors(struct ixgbe_adapter *adapter)
{
    int q_vectors = adapter->num_q_vectors;
    int rxr_remaining = adapter->num_rx_queues;//rx ring num
    int txr_remaining = adapter->num_tx_queues;//tx ring num
    int xdp_remaining = adapter->num_xdp_queues;
    int rxr_idx = 0, txr_idx = 0, xdp_idx = 0, v_idx = 0;
    int err;

    /* only one q_vector if MSI-X is disabled. */
    if (!(adapter->flags & IXGBE_FLAG_MSIX_ENABLED))
        q_vectors = 1;

    if (q_vectors >= (rxr_remaining + txr_remaining + xdp_remaining)) { // if the num of q vector is enaugh,every rx ring alloc a q vector
        for (; rxr_remaining; v_idx++) {
            err = ixgbe_alloc_q_vector(adapter, q_vectors, v_idx,
                           0, 0, 0, 0, 1, rxr_idx);

            if (err)
                goto err_out;

            /* update counts and index */
            rxr_remaining--;
            rxr_idx++;
        }
    }

    for (; v_idx < q_vectors; v_idx++) {
        int rqpv = DIV_ROUND_UP(rxr_remaining, q_vectors - v_idx);//tail of the rxr_remaining/(q_vectors - v_idx)
        int tqpv = DIV_ROUND_UP(txr_remaining, q_vectors - v_idx);
        int xqpv = DIV_ROUND_UP(xdp_remaining, q_vectors - v_idx);

        err = ixgbe_alloc_q_vector(adapter, q_vectors, v_idx,
                       tqpv, txr_idx,
                       xqpv, xdp_idx,
                       rqpv, rxr_idx);

        if (err)
            goto err_out;

        /* update counts and index */
        rxr_remaining -= rqpv;
        txr_remaining -= tqpv;
        xdp_remaining -= xqpv;
        rxr_idx++;
        txr_idx++;
        xdp_idx += xqpv;
    }
}
```
ixgbe_alloc_q_vector函数是具体为收发队列分配中断向量的函数。具体在下文进行分析，但此处有一点需要注意，函数中有两个for循环，但是第一个for循环是在if条件中的，如果有足够的中断向量，则为每个收队列分配单独的中断向量，这样做可以提升网卡处理效率。
ixgbe_alloc_q_vector函数会为收发队列分配一个中断向量，一般来说如果中断向量不充足，则一个中断向量对应一个tx队列和一个rx队列，如果中断向量特别少的时候可能会有多个tx和rx队列在同一个向量。
为了方便之后的查看先列出ixgbe_alloc_q_vector函数声明和各个参数的意义。
```c
/**
 * ixgbe_alloc_q_vector - Allocate memory for a single interrupt vector
 * @adapter: board private structure to initialize
 * @v_count: q_vectors allocated on adapter, used for ring interleaving
 * @v_idx: index of vector in adapter struct
 * @txr_count: total number of Tx rings to allocate
 * @txr_idx: index of first Tx ring to allocate
 * @xdp_count: total number of XDP rings to allocate
 * @xdp_idx: index of first XDP ring to allocate
 * @rxr_count: total number of Rx rings to allocate
 * @rxr_idx: index of first Rx ring to allocate
 *
 * We allocate one q_vector.  If allocation fails we return -ENOMEM.
static int ixgbe_alloc_q_vector(struct ixgbe_adapter *adapter,                                                        
                int v_count, int v_idx,
                int txr_count, int txr_idx,
                int xdp_count, int xdp_idx,
                int rxr_count, int rxr_idx)
**/

```
然后对函数进行具体的分析，函数源码很多，此处只列举一个关键代码，有兴趣的同学可以在linux源码中查看：
```c
static int ixgbe_alloc_q_vector(struct ixgbe_adapter *adapter,
                int v_count, int v_idx,
                int txr_count, int txr_idx,
                int xdp_count, int xdp_idx,
                int rxr_count, int rxr_idx)
{
    ring_count = txr_count + rxr_count + xdp_count;//current v_idx, ring vctort count
    size = sizeof(struct ixgbe_q_vector) +
           (sizeof(struct ixgbe_ring) * ring_count);

        /* allocate q_vector and rings */
    q_vector = kzalloc_node(size, GFP_KERNEL, node);//alloc 1 interrupt vector and ring_count ixgbe ring
    q_vector->numa_node = node; //set the ixgbe q vector numa node
    netif_napi_add(adapter->netdev, &q_vector->napi, //add napi to ixgbe and callback function ixgbe_poll
               ixgbe_poll, 64);
    adapter->q_vector[v_idx] = q_vector;//add current q vector to the adapter q vectro array
    /* initialize pointer to rings */
    ring = q_vector->ring;

    while (txr_count) {
        /* assign generic ring traits */
        ring->dev = &adapter->pdev->dev;
        ring->netdev = adapter->netdev;

        /* configure backlink on ring */
        ring->q_vector = q_vector;

        /* update q_vector Tx values */
        ixgbe_add_ring(ring, &q_vector->tx);

        /* apply Tx specific ring traits */
        ring->count = adapter->tx_ring_count;
        if (adapter->num_rx_pools > 1)
            ring->queue_index =
                txr_idx % adapter->num_rx_queues_per_pool;
        else
            ring->queue_index = txr_idx;

        /* assign ring to adapter */
        adapter->tx_ring[txr_idx] = ring;

        /* update count and index */
        txr_count--;
        txr_idx += v_count; //add next to the txr_idx 

        /* push pointer to next ring */
        ring++; //add length of struct ixgbe_ring
    }
    ...
}
```
函数分配了sizeof(struct ixgbe_q_vector)和(sizeof(struct ixgbe_ring) * ring_count想加大小的连续内存空间,代码中的node都是numa node，numa是一种隔离cpu的技术，有兴趣具体的大家可以google。netif_napi_add是一个为中断向量注册new api的函数，并且为ixgbe网卡注册了ixgbe_poll回调函数。该部分的具体作用即使功能会在后续的网卡接收原理中进行详细的介绍。代码中只列出了对tx队列的操作，rx和xdp有类似的操作，此处不再赘述，些许差异有兴趣大家可以阅读linux源码。ring->q_vector = q_vector;实现分配中断向量到队列。


SRIOV及其RDMA部分有时间在之后的博客中进行介绍。

转载请注明: http://jhyan.me/2017/10/24/网卡驱动（ixgbe为例）/

