---
title: OVS源码分析--函数栈
date: 2017-08-19 00:34:14
---
总结了一些关于OVS源码的函数栈，以便阅读代码和修改代码时候方便查询。主要包括bridge和port相关，tunnel相关，多播相关，forword相关。当前总结还不够全面，之后还会继续更新不断添加。
## OVS函数栈

### Bridge相关

cmd:ovs-vsctl add-br br0
main(ovs-vsctl.c)-------------
ctl_parse_commands:	   //parse the commands,
ovsdb_idl_create 	//initialize the idl, create ovsdb.
ovsdb_idl_get_seqno		//'seqno' is the database sequence number for which we last tried to 	execute our transaction.
ovsdb_idl_get_seqno		//get current seqno
ovsdb_idl_run  	//run ovsdb
do_vsctl  -------------------
ovsdb_idl_txn_create		//create txn object
ovsrec_open_vswitch_first	
vsctl_context_init		//create command context
c→syntax→run	//base on vsctl_commands, callback ‘cmd_add_br’
cmd_add_br---------------- 
The main function of this is update the ovsdb base on the ctx.
Ovs-vswitchd get the ovsdb change. 
main(ovs-vswitchd.c)----------
bridge_run
bridge_reconfigure
add_del_bridges
bridge_create		//alloc bridge
eth_addr_mark_random
bridge_delete_ofprotos	//delete invalidate ofprotos
ofproto_create			//add ofproto to bridge
ofproto_class_find		//class is ofproto_dpif_class
class->construct	//callback  construct in ofproto_dpif_class
open_dpif_backer
dpif_create_and_open
dpif_create
dpif_open
do_open
dp_initialize
dp_register_provider	//register dpif_netlink_class and dpif_netdev_class
dp_class_lookup	//find registered_class is dpif_netlink_class
dpif_class→open 	//callback dpif_netlink_open
dpif_netlink_dp_init
dp_request.cmd = OVS_DP_CMD_NEW
dpif_netlink_dp_transact
dpif_netlink_dp_to_ofpbuf	//add dp info to ofpbuf
nl_transact
open_dpif	//create dpif for dp

kernel create dp interface
genl_register_family(dp_genl_families[i]) 		//register genetlink families
dp_datapath_genl_ops[] = {
{ .cmd = OVS_DP_CMD_NEW,
.flags = GENL_UNS_ADMIN_PERM, /* Requires CAP_NET_ADMIN privilege. */
.policy = datapath_policy,
.doit = ovs_dp_cmd_new
},
ovs_dp_cmd_new
ovs_dp_cmd_alloc_info
genlmsg_new		//parse genetlink msg
ovs_flow_tbl_init		//alloc dp flow table
parms.type = OVS_VPORT_TYPE_INTERNAL;
parms.port_no = OVSP_LOCAL;
parms.upcall_portids = a[OVS_DP_ATTR_UPCALL_PID];
new_vport			//ovsbr0
ovs_vport_add
ovs_vport_lookup (ops  internel)
ops→create 	callback internal_dev_create (ovs_internal_vport_ops)
register_netdevice	//guess it is ovsbr0_sys
dev_set_promiscuity		//value 1
ovs_dp_cmd_fill_info
ovs_notify

Del

port_destroy
iface_destroy
close_dpif_backer
dpif_netlink_rtnl_port_destroy
port_del
dpif_netlink_port_del
dpif→dpif_class→port_del  dpif_netlink_port_del,
dpif_port_del
ofproto_class→port_del          port_del
ofproto_port_del
type_run
bridge_delete_or_reconfigure_ports
bridge_reconfigure

### Port相关
As same as bridge created in most  process.
main(Ovs-vsctl.c) will use cmd_add_port
add_port()
insert port information to the ovsdb
bridge_reconfigure
add_del_bridges
bridge_delete_ofprotos
ofproto_create
bridge_add_ports
bridge_add_ports
iface_create
iface_do_create
ofproto_port_add
ofproto→ofproto_class→port_add		//class is ofproto_dpif_class	callback port_add
dpif_port_add
dpif→dpif_class→port_add 		//callback dpif_netlink_class→dpif_netlink_port_add
dpif_netlink_port_add_compat
dpif_netlink_port_add   	// with arg struct ofpbuf *options =NULL
request.cmd = OVS_VPORT_CMD_NEW
request.type = OVS_VPORT_TYPE_NETDEV
dpif_netlink_vport_transact
dpif_netlink_vport_to_ofpbuf
nl_transact
port_create

kernel dp add port netdev
dp_vport_genl_family	//(S)
dp_vport_genl_ops		//(S)
{ .cmd = OVS_VPORT_CMD_NEW,
  .flags = GENL_UNS_ADMIN_PERM, /* Requires CAP_NET_ADMIN privilege. */
  .policy = vport_policy,
  .doit = ovs_vport_cmd_new
},
ovs_vport_cmd_new
get_dp
ovs_vport_ovsl 	//verify portno
new_vport
ovs_vport_add
ovs_vport_lookup

### Tunnel相关
2.8
dpif_netlink_port_add:
dpif_netlink_rtnl_port_create_and_add
dpif_netlink_rtnl_port_create
netdev_get_tunnel_config
get_netdev_tunnel_config
dpif_netlink_rtnl_create

### 多播相关
multicast: (action=normal)
do_xlate_actions
xlate_output_action
xlate_normal
is_igmp
mcast_snooping_is_membership
xlate_normal_mcast_send_mrouters		//send pkts to all ports that connect with the multicast router.
xlate_normal_mcast_send_rports
xlate_normal_flood

### Forword相关
UserSpase:
创建udpif_upcall_handler流程：
Main（ovs-vswitchd.c）---> bridge_run ---> bridge_reconfigure ---> ofproto_create--->construct ---> open_dpif_backer --->udpif_create--->udpif_set_threads--->udpif_start_threads---> udpif_upcall_handler

udpif_upcall_handler接收upcall流程：

udpif_upcall_handler ---> recv_upcalls---> process_upcall ---> upcall_xlate ---> xlate_actions -

rule_dpif_lookup_from_table
--> do_xlate_actions---> handle_upcalls

kernel:
简单的提供一些函数，具体实现可以看ovs源码。
netdev_create
ovs_netdev_link
netdev_port_receive
ovs_vport_receive
ovs_dp_process_packet
ovs_flow_tbl_lookup_stats
ovs_flow_key_extract
flow_lookup
两种查询方式具体可以看源码。
upcall
ovs_execute_actions


转载请注明: http://jhyan.me/2017/08/19/OVS源码函数栈/
