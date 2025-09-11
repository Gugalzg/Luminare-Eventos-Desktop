import { useState } from 'react'
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar'
import { 
  MdDashboard,
  MdTrendingUp,
  MdTrendingDown, 
  MdCategory,
  MdBarChart,
  MdSettings,
  MdMenu
} from 'react-icons/md'

interface SidebarNavigationProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function SidebarNavigation({ currentView, onViewChange }: SidebarNavigationProps) {
  const [collapsed, setCollapsed] = useState(false)

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  // Cores personalizadas
  const colors = {
    primary: '#212038',
    secondary: '#FFFFFF',
    accent: '#6366f1',
    hover: 'rgba(255, 255, 255, 0.1)'
  }

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>
      <Sidebar
        collapsed={collapsed}
        width="250px"
        collapsedWidth="60px"
        backgroundColor={colors.primary}
        rootStyles={{
          border: 'none',
          height: '100vh',
        }}
        breakPoint="md"
      >
        {/* Header da Sidebar */}
        <div style={{
          padding: collapsed ? '20px 10px' : '20px 24px',
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          height: '70px'
        }}>
          {!collapsed && (
            <div>
              <h1 style={{
                color: colors.secondary,
                margin: 0,
                fontSize: '18px',
                fontWeight: '600'
              }}>
                LuminareEventos
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0,
                fontSize: '12px',
                marginTop: '4px'
              }}>
                Controle Financeiro
              </p>
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              color: colors.secondary,
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <MdMenu size={20} />
          </button>
        </div>

        {/* Menu Principal */}
        <Menu
          menuItemStyles={{
            button: ({ active }) => ({
              backgroundColor: active ? colors.accent : 'transparent',
              color: colors.secondary,
              borderRadius: collapsed ? '8px' : '8px 0 0 8px',
              margin: collapsed ? '8px' : '8px 16px 8px 0',
              marginLeft: collapsed ? '8px' : '16px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: active ? colors.accent : colors.hover,
                color: colors.secondary,
              },
              '.ps-menu-icon': {
                minWidth: '20px !important',
                marginRight: collapsed ? '0' : '12px',
                color: colors.secondary,
              },
              '.ps-menu-label': {
                fontWeight: '500',
              }
            }),
          }}
        >
          <div style={{ padding: '16px 0' }}>
            {/* Dashboard */}
            <MenuItem
              icon={<MdDashboard size={20} />}
              active={currentView === 'dashboard'}
              onClick={() => onViewChange('dashboard')}
            >
              Dashboard
            </MenuItem>

            {/* Entradas */}
            <MenuItem
              icon={<MdTrendingUp size={20} />}
              active={currentView === 'entradas'}
              onClick={() => onViewChange('entradas')}
            >
              Entradas
            </MenuItem>

            {/* Saídas */}
            <MenuItem
              icon={<MdTrendingDown size={20} />}
              active={currentView === 'saidas'}
              onClick={() => onViewChange('saidas')}
            >
              Saídas
            </MenuItem>

            {/* Categorias */}
            <MenuItem
              icon={<MdCategory size={20} />}
              active={currentView === 'categories'}
              onClick={() => onViewChange('categories')}
            >
              Categorias
            </MenuItem>

            {/* Relatórios */}
            <MenuItem
              icon={<MdBarChart size={20} />}
              active={currentView === 'reports'}
              onClick={() => onViewChange('reports')}
            >
              Relatórios
            </MenuItem>
          </div>

          {/* Seção inferior */}
          <div style={{ 
            position: 'absolute',
            bottom: '20px',
            left: 0,
            right: 0,
            padding: collapsed ? '0 8px' : '0 16px'
          }}>
            <MenuItem
              icon={<MdSettings size={20} />}
              active={currentView === 'settings'}
              onClick={() => onViewChange('settings')}
            >
              Configurações
            </MenuItem>
          </div>
        </Menu>
      </Sidebar>
    </div>
  )
}
